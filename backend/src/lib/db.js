import mongoose from "mongoose"
import { ENV } from "./env.js"
import dns from "dns"

export const connectDB = async() => {
    try{
        dns.setServers(["1.1.1.1", "8.8.8.8"]);        
        const conn = await mongoose.connect(ENV.MONGODB_URI, { dbName: ENV.DB_NAME });
        console.log("Connected to MongoDB: ",conn.connection.host);
    }
    catch(error){
        console.log("Error connecting to MongoDB",error);
        process.exit(1)
    }
}