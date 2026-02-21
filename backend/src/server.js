import express from "express"
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { functions, inngest } from "./lib/inngest.js";
import { clerkMiddleware } from '@clerk/express'
import {serve} from "inngest/express"
import { protectRoute } from "./middlewares/protectRoute.js";
import cors from "cors"
const app = express();

//middleware
app.use(express.json())
app.use(cors({origin:ENV.CLIENT_URL,Credential:true}))
app.use("/api/inngest",serve({client:inngest,functions}))
app.use(clerkMiddleware())
  

// chat routes
import chatRoutes from "./Routes/chatRoutes.js"
import sessionRoutes from "./Routes/sessionRoutes.js"
app.use("/api/chat",chatRoutes);
app.use("/api/session",sessionRoutes);
app.get("/health",(req,res)=>{
    req.auth
    res.status(200).json({msg:"api is up and running"})
})


const startSever = async() => {
    try {
        await connectDB();
        app.listen(ENV.PORT,()=>"Server is started")
    } catch (error) {
        console.error("Database connection error",error);   
    }
}

startSever()