import AgoraCallService from './AgoraCall.js';
import { AgoraCredentials, fetchAgoraToken } from '../constants/index.js';

document.addEventListener('DOMContentLoaded', async () => {
    const agoraCallService = new AgoraCallService();
    const channelName = "911"; // The channel for passive listening
    const uid = 0; // Use 0 for passive listeners, Agora will assign if null is passed to joinChannel

    try {
        // Fetch token from backend
        const token = await fetchAgoraToken(channelName, uid);

        // Join the channel as a passive listener (publishAudio = false)
        await agoraCallService.joinChannel(
            AgoraCredentials.AGORA_APP_ID,
            channelName,
            token,
            null, // Let Agora assign a UID for the client
            false // Do not publish audio
        );
        console.log(`Successfully joined channel ${channelName} as a passive listener.`);
    } catch (error) {
        console.error("Failed to join Agora channel:", error);
    }
});
