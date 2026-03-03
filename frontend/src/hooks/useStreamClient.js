import { useEffect, useRef, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";
import { sessionApi } from "../api/sessions";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  const videoClientRef = useRef(null);
  const chatClientRef = useRef(null);

  useEffect(() => {
    if (!session?.callId || loadingSession) return;
    if (!isHost && !isParticipant) return;

    let isMounted = true;

    const init = async () => {
      setIsInitializingCall(true);

      try {
        const tokenData = await sessionApi.getStreamToken();
        const { token, userId, userImage } = tokenData;
        const userName = tokenData.userName || userId;

        if (!isMounted) return;

        // ── Video client ──────────────────────────────────────────────────
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: { id: userId, name: userName, image: userImage },
          token,
        });
        videoClientRef.current = videoClient;

        const callInstance = videoClient.call("default", session.callId);
        await callInstance.join({ create: false });

        if (!isMounted) return;
        setStreamClient(videoClient);
        setCall(callInstance);

        // ── Chat client ───────────────────────────────────────────────────
        const chatCl = StreamChat.getInstance(STREAM_API_KEY);
        chatClientRef.current = chatCl;
        await chatCl.connectUser({ id: userId, name: userName, image: userImage }, token);

        const channelInstance = chatCl.channel("messaging", session.callId);
        await channelInstance.watch();

        if (!isMounted) return;
        setChatClient(chatCl);
        setChannel(channelInstance);
      } catch (err) {
        console.error("Stream initialization error:", err);
      } finally {
        if (isMounted) setIsInitializingCall(false);
      }
    };

    init();

    return () => {
      isMounted = false;

      const videoClient = videoClientRef.current;
      const chatCl = chatClientRef.current;
      videoClientRef.current = null;
      chatClientRef.current = null;

      if (videoClient) videoClient.disconnectUser().catch(console.error);
      if (chatCl) chatCl.disconnectUser().catch(console.error);

      setStreamClient(null);
      setCall(null);
      setChatClient(null);
      setChannel(null);
    };
  }, [session?.callId, isHost, isParticipant, loadingSession]);

  return { call, channel, chatClient, isInitializingCall, streamClient };
}
