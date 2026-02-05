require("dotenv").config();
const app = require("./src/app.js").default;

const connectDatabase = require("./src/config/database.js");

const { env } = require("./src/config/env.js");

async function start() {
  try {
    await connectDatabase();
    app.listen(env.port || 5000, () => {
      console.log(`API listening on port ${env.port || 5000}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
