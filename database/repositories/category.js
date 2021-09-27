const knex = require("../knex");

const countAll = async (where = {}, whereNot = {}) => {
  try {
    let categories = await knex("categories")
      .where(where)
      .whereNot(whereNot)
      .count({ count: "*" })
      .first();
    return parseInt(categories.count);
  } catch (error) {
    throw error;
  }
};

const findCategoryOfAnUser = async (user, uuid) => {
  try {
    let categories = await knex("categories")
      .where({
        user_uuid: user,
        uuid,
      })
      .first();
    return categories;
  } catch (error) {
    throw error;
  }
};

const findCategoriesOfAnUser = async (user, filters = {}) => {
  try {
    let categories = await knex("categories")
      .where({
        user_uuid: user,
        ...filters,
      })
      .select("*");
    return categories;
  } catch (error) {
    throw error;
  }
};

const first = async (where = {}) => {
  try {
    let categories = await knex("categories").where(where).first();
    return categories;
  } catch (error) {
    throw error;
  }
};

const deleteCategory = async (category_uuid) => {
  try {
    let categories = await knex("categories")
      .where("uuid", "=", category_uuid)
      .del();
    return categories;
  } catch (error) {
    throw error;
  }
};

const findAll = async (where = {}) => {
  try {
    let categories = await knex("categories").where(where).select("*");
    return categories;
  } catch (error) {
    throw error;
  }
};

const createCategory = async (payload) => {
  try {
    payload["created_at"] = new Date().toISOString();
    payload["updated_at"] = new Date().toISOString();
    let category = await knex("categories").insert(payload).returning("*");
    return category[0];
  } catch (error) {
    throw error;
  }
};

const updateCategory = async (category_uuid, payload) => {
  try {
    payload["updated_at"] = new Date().toISOString();
    let category = await knex("categories")
      .where("uuid", "=", category_uuid)
      .update(payload)
      .returning("*");
    return category[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  countAll,
  first,
  findCategoryOfAnUser,
  findCategoriesOfAnUser,
};
