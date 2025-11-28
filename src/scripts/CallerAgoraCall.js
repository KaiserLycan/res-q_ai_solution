import AgoraCallService from './AgoraCall.js';
import { AgoraCredentials, fetchAgoraToken } from '../constants/index.js';

document.addEventListener('DOMContentLoaded', () => {
    const agoraCallService = new AgoraCallService();
    const sosBtn = document.getElementById('sosBtn');
    const channelName = "911"; // The channel for SOS calls

    let isCalling = false;

    sosBtn.addEventListener('click', async () => {
        if (!isCalling) {
            // Start the call
            try {
                // Generate a random UID for the caller
                const uid = Math.floor(Math.random() * 100000); 
                // Fetch token from backend
                const token = await fetchAgoraToken(channelName, uid);

                await agoraCallService.joinChannel(
                    AgoraCredentials.AGORA_APP_ID,
                    channelName,
                    token,
                    uid // Use the generated UID
                );
                console.log(`Successfully joined channel ${channelName} via SOS button.`);
                sosBtn.textContent = "END SOS";
                isCalling = true;
            } catch (error) {
                console.error("Failed to join Agora channel:", error);
                alert("Failed to start SOS call. Please try again.");
            }
        } else {
            // End the call
            try {
                await agoraCallService.leaveChannel();
                console.log(`Successfully left channel ${channelName}.`);
                sosBtn.textContent = "SOS";
                isCalling = false;
            } catch (error) {
                console.error("Failed to leave Agora channel:", error);
                alert("Failed to end SOS call. Please try again.");
            }
        }
    });
});
