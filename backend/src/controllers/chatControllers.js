import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req,res){
    try {
        const streamUserId = req.user._id.toString();
        const token = chatClient.createToken(streamUserId);

        res.status(200).json(
            {
                token,
                userId: streamUserId,
                userName:req.user.name,
                userImage:req.user.profileImage,
            }
        )
    } catch (error) {
        console.log("Error in getStreamToken controller: ", error.message)
        res.status(500).json({message:"Interval server error"})  
    }
}