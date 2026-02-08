import mongoose from "mongoose";
import env from "./env";

async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}

module.exports = connectDatabase;
