import dotenv from "dotenv"

dotenv.config();

export const ENV = {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    DB_NAME:process.env.DB_NAME,
    CLIENT_URL:process.env.CLIENT_URL,
    STREAM_API_KEY:process.env.STREAM_API_KEY,
    STREAM_API_SECRET:process.env.STREAM_API_SECRET,
    CLERK_PUBLISHABLE_KEY:process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY:process.env.CLERK_SECRET_KEY,
    INNGEST_EVENT_KEY:process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY:process.env.INNGEST_SIGNING_KEY,
    NODE_ENV:process.env.NODE_ENV,
}

