const dotenv = require("dotenv");

dotenv.config();

const env = {
	port: process.env.PORT || "5000",
	mongoUri: process.env.MONGO_URI || "",
	jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
	jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
	jwtAccessExpiresIn: "1h",
	jwtRefreshExpiresIn: "7d",
};

module.exports = { env };
