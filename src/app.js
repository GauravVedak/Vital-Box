// app.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { User } from "./auth/models/user.js";
import { RefreshToken } from "./auth/models/refreshToken.js";
import { env } from "./config/env.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow CORS from frontend (for dev)
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Helper: generate tokens
function generateTokens(user) {
  const payload = { sub: user._id.toString(), email: user.email };

  const accessToken = jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn || "15m",
  });

  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn || "7d",
  });

  return { accessToken, refreshToken };
}

// Helper: set cookies
function setAuthCookies(res, accessToken, refreshToken, refreshMaxAgeMs) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: refreshMaxAgeMs, // e.g. 7 days
  });
}

// User Registration
app.post("/api/auth/register", async (req, res) => {
  console.log("Register endpoint called", req.body);
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      passwordHash,
      name: name || email.split("@")[0],
    });
    await user.save();

    console.log("User registered successfully", user._id);
    return res
      .status(201)
      .json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
});

// User Login (access + refresh tokens in cookies)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // store refresh token in DB with TTL
    const refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + refreshMaxAgeMs),
    });

    setAuthCookies(res, accessToken, refreshToken, refreshMaxAgeMs);

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Refresh access token using refresh token
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const token =
      req.cookies?.refresh_token || req.body?.refreshToken || null;

    if (!token) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtRefreshSecret);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const stored = await RefreshToken.findOne({ token });
    if (!stored) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    const user = await User.findById(stored.userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const { accessToken } = generateTokens(user);

    setAuthCookies(res, accessToken, token, stored.expiresAt.getTime() - Date.now());

    return res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Logout: clear cookies + delete refresh token
app.post("/api/auth/logout", async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      await RefreshToken.deleteOne({ token }).catch(() => {});
    }

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("access_token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    res.cookie("refresh_token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Sync Auth0 user to MongoDB (unchanged)
app.post("/api/auth/sync-auth0-user", async (req, res) => {
  console.log("Sync Auth0 user endpoint called", req.body);
  try {
    const { auth0UserId, email, name, picture } = req.body;

    if (!auth0UserId || !email) {
      console.error("Missing required fields: auth0UserId or email");
      return res
        .status(400)
        .json({ message: "Auth0 user ID and email are required." });
    }

    let user = await User.findOne({ auth0UserId });

    if (user) {
      user.email = email;
      if (name) user.name = name;
      if (picture) user.picture = picture;
      await user.save();
      return res.status(200).json({
        message: "User updated successfully.",
        user: {
          id: user._id,
          email: user.email,
          auth0UserId: user.auth0UserId,
          name: user.name,
        },
        status: "updated",
      });
    }

    user = await User.findOne({ email });

    if (user) {
      user.auth0UserId = auth0UserId;
      if (name) user.name = name;
      if (picture) user.picture = picture;
      await user.save();
      return res.status(200).json({
        message: "User updated successfully.",
        user: {
          id: user._id,
          email: user.email,
          auth0UserId: user.auth0UserId,
          name: user.name,
        },
        status: "updated",
      });
    }

    user = new User({
      email,
      auth0UserId,
      name: name || undefined,
      picture: picture || undefined,
      status: "active",
    });
    await user.save();

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        id: user._id,
        email: user.email,
        auth0UserId: user.auth0UserId,
        name: user.name,
      },
      status: "created",
    });
  } catch (err) {
    console.error("Sync Auth0 user error:", err);
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
});

export default app;
