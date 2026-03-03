import { streamClient,chatClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req,res){
    try {
        const {problem,difficulty} = req.body;
        const userId = req.user._id;
        const streamUserId = req.user._id.toString();

        if (!problem || !difficulty) return res.status(400).json({msg:"Problem and Difficulty is required"});

        // generate a unique call id
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

        const session = await Session.create({problem,difficulty,host:userId,callId})

        // Stream operations are non-blocking — session creation always succeeds
        try {
            await streamClient.video.call("default",callId).getOrCreate({
                data:{
                    created_by_id:streamUserId,
                    custom:{
                        problem:problem,
                        difficulty:difficulty,
                        sessionId: session._id.toString(),
                    }
                }
            })
            const channel = chatClient.channel("messaging",callId,{
                name:`${problem} Session`,
                created_by_id:streamUserId,
                members: [streamUserId]
            })
            await channel.create();
        } catch (streamError) {
            console.error("Stream setup failed (non-fatal):", streamError.message);
        }

        return res.status(201).json({session:session})
    } catch (error) {
        console.error("Error in creating a session",error.message)
        res.status(500).json({msg:"Interval Server Error"})
    }
}

export async function getActiveSessions(req,res){
    try {
        const sessions = await Session.find({status:"active"}).populate("host","username profileImage email").sort({createdAt:-1}).limit(20);
        res.status(200).json({sessions})
    } catch (error) {
        console.error("Error in getting active sessions",error.message);
        res.status(500).json({msg:"Interval Server Error"})
    }
}

export async function getRecentSessions(req,res){
    try {
        // get session where user is either host or participant
        const userId = req.user._id;
        const sessions = await Session.find({
            status:"completed",
            $or:[{host:userId},{participant:userId}]
        }).sort({createdAt:-1}).limit(20);
        res.status(200).json({sessions});
    } catch (error) {
        console.error("Error in getting recent sessions",error.message);
        res.status(500).json({msg:"Interval Server Error"})
    }
}

export async function getSessionById(req,res){
    try {
        const {id} = req.params;
        const session = await Session.findById(id).populate("host","name email profileImage")
        .populate("participant", "name email profileImage")

        if (!session) return res.status(404).json({msg:"Session not found"});

        return res.status(200).json({session});
    } catch (error) {
        console.error("Error in getting session",error.message);
        res.status(500).json({msg:"Interval Server Error"})
  
    }
}
export async function joinSession(req,res) {
    try {
        const {id} = req.params;
        const userId = req.user._id;
        const streamUserId = req.user._id.toString();
        
        const session = await Session.findById(id);

        if (!session) return res.status(404).json({msg:"Session not found"});

        if (session.status !== "active") {
            return res.status(400).json({msg:"cannot join a completed session"});
        }
        if (session.host.toString() === userId.toString()) {
            return res.status(400).json({msg:"Host cannot join their own session as participant"})
        }

        if (session.participant) return res.status(409).json({msg:"Session is full"});
        session.participant = userId;
        await session.save(); 

        const channel = chatClient.channel("messaging",session.callId);
        await channel.addMembers([streamUserId])

        return res.status(200).json({session});
    } catch (error) {
        console.error("Error in joining session",error.message);
        res.status(500).json({msg:"Interval Server Error"})
    }
}
export async function endSession(req,res){
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);
        if (!session) return res.status(404).json({msg:"Session not found"});
        
        // check if user is host or not
        if (session.host.toString() !== userId.toString()) {
            return res.status(403).json({msg:"Only host can end the session"})
        } 

        // check if session already completed
        if (session.status === "completed") {
            return res.status(400).json({msg:"Session is already completed"})
        }
        else {
            session.status = "completed"
            await session.save();

            const call = streamClient.video.call("default",session.callId);
            await call.delete({hard:true})

            // delete stream chat channel
            const channel = chatClient.channel("messaging",session.callId);
            await channel.delete();
            return res.status(200).json({session,msg:"Session is successfully ended"})
        }
    } catch (error) {
        console.error("Error ending session", error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

