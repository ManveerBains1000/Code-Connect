import dotenv from "dotenv"

dotenv.config();

export const ENV = {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    DB_NAME:process.env.DB_NAME,
    CLIENT_URL:process.env.CLIENT_URL,
    STREAM_API_KEY:process.env.STREAM_API_KEY,
    STREAM_API_SECRET:process.env.STREAM_API_SECRET,
    JWT_SECRET:process.env.JWT_SECRET,
    INNGEST_EVENT_KEY:process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY:process.env.INNGEST_SIGNING_KEY,
    NODE_ENV:process.env.NODE_ENV,
}

