import { RefreshToken } from "./auth/models/refreshToken.js"; // at the top

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
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const stored = await RefreshToken.findOne({ token });
    if (!stored) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    const user = await User.findById(stored.userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // issue new access token
    const payloadOut = { sub: user._id.toString(), email: user.email };
    const accessToken = jwt.sign(payloadOut, env.jwtAccessSecret, {
      expiresIn: env.jwtAccessExpiresIn || "15m",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});
