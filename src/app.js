const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { User } = require("./auth/models/user");
const { env } = require("./config/env");

const app = express();
app.use(express.json());

// Allow CORS from frontend
app.use(cors({
	origin: ["http://localhost:3000"],
	credentials: true,
}));

// Health check
app.get("/", (req, res) => {
	res.json({ status: "ok" });
});

// User Registration
app.post("/api/auth/register", async (req, res) => {
	console.log("Register endpoint called", req.body);
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			console.error("Missing email or password");
			return res.status(400).json({ message: "Email and password are required." });
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			console.error("User already exists");
			return res.status(409).json({ message: "User already exists." });
		}
		const passwordHash = await bcrypt.hash(password, 10);
		const user = new User({ email, passwordHash });
		await user.save();
		console.log("User registered successfully", user);
		return res.status(201).json({ message: "User registered successfully." });
	} catch (err) {
		console.error("Registration error:", err);
		return res.status(500).json({ message: "Server error.", error: err.message });
	}
});

// User Login
app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required." });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials." });
		}
		const isMatch = await bcrypt.compare(password, user.passwordHash);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials." });
		}
		const token = jwt.sign(
			{ sub: user._id, email: user.email },
			env.jwtAccessSecret,
			{ expiresIn: env.jwtAccessExpiresIn }
		);
		return res.status(200).json({ token, user: { email: user.email } });
	} catch (err) {
		return res.status(500).json({ message: "Server error." });
	}
});

module.exports = app;
