const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function requireAuth(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token =
		authHeader && authHeader.startsWith("Bearer ")
			? authHeader.slice("Bearer ".length)
			: undefined;

	if (!token) {
		return res.status(401).json({ message: "Missing authorization token" });
	}

	try {
		const payload = jwt.verify(token, env.jwtAccessSecret);
		req.user = { userId: payload.sub, email: payload.email };
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}

module.exports = { requireAuth };
