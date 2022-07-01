const pickKeysFromObject = requireUtil("pickKeysFromObject");

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

  let manyToManyRelations = attributes.filter((c) => {
    return c.type === "relation" && c.relation === "manyToMany";
  });

  for (
    let manyToManyCounter = 0;
    manyToManyCounter < manyToManyRelations.length;
    manyToManyCounter++
  ) {
    const manyToManyRelation = manyToManyRelations[manyToManyCounter];
    let payloadRelations = payload[manyToManyRelation.name];

    const primaryKey = findPrimaryKey(
      resourceModels[manyToManyRelation.resource]
    );

    for (
      let payloadRelationCounter = 0;
      payloadRelationCounter < payloadRelations.length;
      payloadRelationCounter++
    ) {
      let payloadRelation = payloadRelations[payloadRelationCounter];
      payloadRelation = mapObjectToResource(
        payloadRelation,
        resourceModels[manyToManyRelation.resource]
      );

      payloadRelations[payloadRelationCounter] = payloadRelation;

      dbOps.push({
        pivot_table: manyToManyRelation["pivot_table"],
        operation: "truncate",
        source_column: manyToManyRelation["source_column"],
      });

      if (payloadRelation[primaryKey] === undefined) {
        dbOps.push({
          table: resourceModels[manyToManyRelation.resource]["sql_table"],
          operation: "create_many_to_many_resource",
          source_column: manyToManyRelation["source_column"],
          relations_column: manyToManyRelation["relations_column"],
          payload: payloadRelation,
          pivot_table: manyToManyRelation["pivot_table"],
          primaryKey: primaryKey,
        });
      } else {
        let opPayload = {};
        opPayload[manyToManyRelation["relations_column"]] =
          payloadRelation[primaryKey];
        dbOps.push({
          table: manyToManyRelation["pivot_table"],
          operation: "create_pivot",
          source_column: manyToManyRelation["source_column"],
          payload: opPayload,
        });
      }
    }
  }
  return dbOps;
};

module.exports = {
  mapObjectToResource,
  findPrimaryKey,
  augmentWithBelongsTo,
  augmentWithManyToMany,
  getColumnsFromAttributes,
};
