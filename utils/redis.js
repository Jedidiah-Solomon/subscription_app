import { client, ensureClientConnected } from "../config/redis-conn.js";

const addDataToCache = async (key, value, expiration = 3600) => {
  try {
    await ensureClientConnected();
    await client.set(key, JSON.stringify(value), { EX: expiration });
  } catch (err) {
    console.error("Error adding data to Redis:", err);
    throw err;
  }
};

const getDataFromCache = async (key) => {
  try {
    await ensureClientConnected();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error retrieving data from Redis:", err);
    throw err;
  }
};

const addHashToCache = async (hashKey, field, value) => {
  try {
    await ensureClientConnected();
    await client.hSet(hashKey, field, JSON.stringify(value));
  } catch (err) {
    console.error("Error adding hash to Redis:", err);
    throw err;
  }
};

const getHashFieldFromCache = async (hashKey, field) => {
  try {
    await ensureClientConnected();
    const data = await client.hGet(hashKey, field);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error retrieving field from hash:", err);
    throw err;
  }
};

const getAllHashFromCache = async (hashKey) => {
  try {
    await ensureClientConnected();
    const data = await client.hGetAll(hashKey);
    return data
      ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, JSON.parse(v)])
        )
      : {};
  } catch (err) {
    console.error("Error retrieving hash from Redis:", err);
    throw err;
  }
};

export {
  addDataToCache,
  getDataFromCache,
  addHashToCache,
  getHashFieldFromCache,
  getAllHashFromCache,
};
