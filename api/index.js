import { app } from "../backend/src/server.js";
import { connectDB } from "../backend/src/lib/db.js";

await connectDB();

export default app;
