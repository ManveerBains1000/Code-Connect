import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import chatRoutes from "./Routes/chatRoutes.js";
import sessionRoutes from "./Routes/sessionRoutes.js";
import authRoutes from "./Routes/authRoutes.js";

export const app = express();

// Public health check before auth
app.get("/health", (req, res) => {
    return res.status(200).json({ msg: "app is running fine" });
});

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

export const startServer = async () => {
    try {
        await connectDB();
        return app.listen(ENV.PORT, () => console.log(`Server started on ${ENV.PORT}`));
    } catch (error) {
        console.error("Database connection error", error);
        throw error;
    }
};

startServer();