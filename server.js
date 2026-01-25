// server.js at project root
const app = require("./src/app");
const { connectDatabase } = require("./src/config/database");
const { env } = require("./src/config/env");

async function start() {
  try {
    await connectDatabase(); // can comment temporarily
    app.listen(env.port || 5000, () => {
      console.log(`API listening on port ${env.port || 5000}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
