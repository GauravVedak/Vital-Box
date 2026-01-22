const app = require("./src/app");
const { connectDatabase } = require("./src/config/database");
const { env } = require("./src/config/env");

async function start() {
	try {
		await connectDatabase();
		console.log("Connected to MongoDB");
		app.listen(env.port, () => {
			console.log(`API listening on port ${env.port}`);
		});
	} catch (err) {
		console.error("Failed to start server", err);
		process.exit(1);
	}
}

start();
