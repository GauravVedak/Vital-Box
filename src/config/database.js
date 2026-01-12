const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDatabase() {
	if (!env.mongoUri) {
		throw new Error("MONGO_URI is not set");
	}
	await mongoose.connect(env.mongoUri);
}

module.exports = { connectDatabase };
