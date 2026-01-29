const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false }, // Optional for Auth0 users
    auth0UserId: { type: String, unique: true, sparse: true }, // Auth0 user ID (sub)
    name: { type: String }, // User's full name from Auth0
    picture: { type: String }, // Profile picture URL from Auth0
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };
