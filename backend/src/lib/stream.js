import {StreamChat} from "stream-chat"
import {StreamClient} from "@stream-io/node-sdk"
import { ENV } from "./env.js"

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;
if (!apiKey || !apiSecret) {
    console.error("Stream API KEY or stream API secret is missing")
}

export const streamClient = new StreamClient(apiKey,apiSecret)
export const chatClient = StreamChat.getInstance(apiKey,apiSecret)

export const upsertStreamUser = async(userData) => {
    try {
        await chatClient.upsertUser(userData)
        console.log("Stream User created sucessfully")
    } catch (error) {
        console.error("Error upserting Stream user: ",user);
    }
}

export const deleteStreamUser = async(userId) => {
    try {
        await chatClient.deleteUser(userId);
        console.log("Stream User is successfully deleted")

    } catch (error) {
        console.error("Error deleting Stream user: ",error); 
    }
}

