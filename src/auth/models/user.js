const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		status: {
			type: String,
			enum: ["active", "suspended"],
			default: "active",
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };
