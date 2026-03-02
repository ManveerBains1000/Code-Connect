import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import { upsertStreamUser } from "../lib/stream.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signToken = (userId) =>
  jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists)
      return res.status(409).json({ message: "Email already in use" });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(409).json({ message: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    });

    // Create Stream user (non-fatal)
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.username,
        image: user.profileImage,
      });
    } catch (e) {
      console.error("Stream upsert failed (non-fatal):", e.message);
    }

    const token = signToken(user._id);
    res.cookie("jwt", token, COOKIE_OPTIONS);

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user._id);
    res.cookie("jwt", token, COOKIE_OPTIONS);

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("jwt", COOKIE_OPTIONS);
  res.status(200).json({ message: "Logged out successfully" });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getMe:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
