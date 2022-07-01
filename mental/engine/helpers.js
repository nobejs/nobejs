const pickKeysFromObject = requireUtil("pickKeysFromObject");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const getColumnsFromAttributes = (resourceSpec) => {
  let columns = resourceSpec.attributes
    .filter((c) => {
      return c.type !== "relation";
    })
    .map((c) => {
      return `${c.name}`;
    });

  return columns;
};

const mapObjectToResource = (object, resource) => {
  let columns = resource.attributes
    .filter((c) => {
      return c.type !== "relation";
    })
    .map((c) => {
      return `${c.name}`;
    });

  return pickKeysFromObject(object, columns);
};

const findPrimaryKey = (resource) => {
  let columns = resource.attributes
    .filter((c) => {
      return c.type !== "relation" && c.primary === true;
    })
    .map((c) => {
      return `${c.name}`;
    });

  return columns[0];
};

const augmentWithBelongsTo = (
  dbRecord,
  payload,
  attributes,
  resourceModels
) => {
  let belongsToRelations = attributes.filter((c) => {
    return c.type === "relation" && c.relation === "belongsTo";
  });

  for (
    let belongsToRelationsCounter = 0;
    belongsToRelationsCounter < belongsToRelations.length;
    belongsToRelationsCounter++
  ) {
    const belongsToRelation = belongsToRelations[belongsToRelationsCounter];

    const payloadRelation = payload[belongsToRelation.name];

    const mappedResource = mapObjectToResource(
      payloadRelation,
      resourceModels[belongsToRelation.resource]
    );

    const primaryKey = findPrimaryKey(
      resourceModels[belongsToRelation.resource]
    );

    dbRecord[belongsToRelation["source_column"]] = mappedResource[primaryKey];
  }

  return dbRecord;
};

const augmentWithManyToMany = (
  dbRecord,
  payload,
  attributes,
  resourceModels
) => {
  const dbOps = [];

  // Find many to many relations for this resource
  let relations = attributes.filter((c) => {
    return c.type === "relation" && c.relation === "manyToMany";
  });

  // Loop through each many to many relations
  for (let counter = 0; counter < relations.length; counter++) {
    let relation = relations[counter];
    // Find if there is a property if with this relation name
    let payloadsForRelation = payload[relation.name];

    if (payloadsForRelation && payloadsForRelation.length > 0) {
      let resourceSpecForRelation = resourceModels[relation.resource];
      let primaryKey = findPrimaryKey(resourceSpecForRelation);

      // Because this is a many to many relations, expected is an array of objects

      for (
        let payloadCounter = 0;
        payloadCounter < payloadsForRelation.length;
        payloadCounter++
      ) {
        let payloadRelation = payloadsForRelation[payloadCounter];
        payloadRelation = mapObjectToResource(
          payloadRelation,
          resourceSpecForRelation
        );

        payloadsForRelation[payloadCounter] = payloadRelation;

        // Clean existing relationships, so, frontend should send all the existing relations

        dbOps.push({
          pivot_table: relation["pivot_table"],
          operation: "truncate",
          source_column: relation["source_column"],
        });

        if (payloadRelation[primaryKey] === undefined) {
          // When an relationship is sent, it's possible, the corresponding resource also should be created
          // Todo - We should validate this payload
          dbOps.push({
            table: resourceModels[relation.resource]["sql_table"],
            operation: "create_many_to_many_resource",
            source_column: relation["source_column"],
            relations_column: relation["relations_column"],
            payload: payloadRelation,
            pivot_table: relation["pivot_table"],
            relationsPrimaryKey: primaryKey,
          });
        } else {
          // The resource already exists, so we only link it
          let opPayload = {};
          opPayload[relation["relations_column"]] = payloadRelation[primaryKey];
          dbOps.push({
            table: relation["pivot_table"],
            operation: "create_pivot",
            source_column: relation["source_column"],
            payload: opPayload,
          });
        }
      }
    }
  }
  return dbOps;
};

const cleanRequestObject = (resourceModels, resource, req) => {
  let attributes = resourceModels[resource]["attributes"];
  let columns = attributes.map((c) => {
    return `${c.name}`;
  });
  columns.push("uuid");
  columns.push("include");
  const payload = findKeysFromRequest(req, columns);
  return payload;
};

module.exports = {
  cleanRequestObject,
  mapObjectToResource,
  findPrimaryKey,
  augmentWithBelongsTo,
  augmentWithManyToMany,
  getColumnsFromAttributes,
};
