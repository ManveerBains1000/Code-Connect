import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { functions, inngest } from "./lib/inngest.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import chatRoutes from "./Routes/chatRoutes.js";
import sessionRoutes from "./Routes/sessionRoutes.js";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distPath = path.join(projectRoot, "frontend", "dist");

// Public health check before auth
app.get("/health", (req, res) => {
    return res.status(200).json({ msg: "app is running fine" });
});

// middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use(clerkMiddleware());

// chat routes
app.use("/api/chat", chatRoutes);
app.use("/api/session", sessionRoutes);

if (ENV.NODE_ENV === "production") {
    app.use(express.static(distPath));
    // Serve SPA for any non-API route
    app.use((req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(distPath, "index.html"));
    });
}

export const startServer = async () => {
    try {
        await connectDB();
        return app.listen(ENV.PORT, () => console.log(`Server started on ${ENV.PORT}`));
    } catch (error) {
        console.error("Database connection error", error);
        throw error;
    }
};

// Only start the server locally. On Vercel we export the app for the serverless handler.
if (process.env.VERCEL !== "1") {
    startServer();
}