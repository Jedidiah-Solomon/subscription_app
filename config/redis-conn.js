import { createClient } from "redis";
import { REDIS_URI } from "./env.js";

const redisUrl = REDIS_URI;

if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not set.");
}

const client = createClient({
  url: redisUrl,
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

const ensureClientConnected = async () => {
  if (!client.isOpen) {
    console.log("Reconnecting to Redis...");
    await client.connect();
  }
};

export { client, ensureClientConnected };
