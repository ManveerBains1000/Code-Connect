import {useMutation,useQuery} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sessionApi } from "../api/sessions"


export const useCreateSession = () => {
    const result = useMutation({
        mutationKey: ["createSession"],
        mutationFn : (data)=> sessionApi.createSession(data),
        onSuccess : () => toast.success("Session created successfully!"),
        onError : (error) => toast.error(error.response.data.message || "Failed to create session") 
    })
    return result;
}
export const useActiveSessions = (enabled = true) => {
    const result = useQuery({
        queryKey: ["activeSessions"],
        queryFn: ()=> sessionApi.getActiveSessions(),
        enabled,
    })
    return result;
};

export const useMyRecentSessions = (enabled = true) => {
    const result = useQuery({
        queryKey: ["myRecentSessions"],
        queryFn: () => sessionApi.getMyRecentSessions(),
        enabled,
    })
    return result;
};
export const useSessionsById = (id) => {
    const result = useQuery({
        queryKey: ["session",id],
        queryFn: () => sessionApi.getSessionById(id),
        enabled: !!id,
        refetchInterval:5000, // refetch every 5 seconds to detect session changes 
    })
    return result;
};

export const useJoinSession = (id) => {
    const result = useMutation({
        mutationKey : ["joinSession"],
         mutationFn: () => sessionApi.joinSession(id),
         onSuccess: () => toast.success("Joined session successfully"),
         onError: (error) => toast.error(error.response.data.message || "Failed to join session")
    })
    return result;
}
export const useEndSession = (id) => {
    const result = useMutation({
        mutationKey : ["endSession"],
         mutationFn: () => sessionApi.endSession(id),
         onSuccess: () => toast.success("session end successfully"),
         onError: (error) => toast.error(error.response.data.message || "Failed to end session")
    })
    return result;
}

