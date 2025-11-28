import { ConversationalAIService } from './ConversationalAI.js';
import { AgoraCredentials, fetchAgoraToken } from '../constants/index.js';

document.addEventListener('DOMContentLoaded', () => {
    const joinAiAgentCallBtn = document.getElementById('joinAiAgentCallBtn');
    const leaveAiAgentCallBtn = document.getElementById('leaveAiAgentCallBtn');

    const aiChannelName = "ai_channel_911"; // The dedicated channel for the AI agent
    let conversationalAIService = null;
    let clientUid = null;

    joinAiAgentCallBtn.addEventListener('click', async () => {
        joinAiAgentCallBtn.disabled = true;
        try {
            clientUid = Math.floor(Math.random() * 100000); // Generate a random UID for the client
            const token = await fetchAgoraToken(aiChannelName, clientUid);

            conversationalAIService = new ConversationalAIService(AgoraCredentials.AGORA_APP_ID);
            await conversationalAIService.joinAndStartAgent(aiChannelName, clientUid, token);
            console.log(`Joined AI Agent channel ${aiChannelName} with UID ${clientUid}`);
            
            leaveAiAgentCallBtn.disabled = false;
        } catch (error) {
            console.error("Failed to join AI Agent call:", error);
            alert("Failed to join AI Agent call. See console for details.");
            joinAiAgentCallBtn.disabled = false;
        }
    });

    leaveAiAgentCallBtn.addEventListener('click', async () => {
        leaveAiAgentCallBtn.disabled = true;
        try {
            if (conversationalAIService) {
                await conversationalAIService.leaveChannel();
                console.log(`Left AI Agent channel ${aiChannelName}`);
            }
            joinAiAgentCallBtn.disabled = false;
        } catch (error) {
            console.error("Failed to leave AI Agent call:", error);
            alert("Failed to leave AI Agent call. See console for details.");
            leaveAiAgentCallBtn.disabled = false;
        }
    });
});
