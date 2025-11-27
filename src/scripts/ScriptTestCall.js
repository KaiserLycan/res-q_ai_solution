// ScriptTestCall.js - Handles form functionality for testcall.html

import AgoraCallService from "./AgoraCall.js";
import { ConversationalAIService } from "./ConversationalAI.js";
import { AgoraCredentials, URLs } from "../constants/index.js";

class TestCallController {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.initializeEventListeners();
        
        // Instantiate the services for both Agora Call and Conversational AI
        this.agoraService = new AgoraCallService();
        // The ConversationalAIService constructor expects the App ID
        this.convoAIService = new ConversationalAIService(AgoraCredentials.AGORA_APP_ID);
    }

    initializeEventListeners() {
        this.forms.forEach((form, index) => {
            const joinBtn = form.querySelector('button[value="join"]');
            const leaveBtn = form.querySelector('button[value="leave"]');
            const idInput = form.querySelector('input[name="ID"]');
            const channelInput = form.querySelector('input[name="Channel"]');

            if (joinBtn) {
                joinBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Pass the numeric UID by converting the string from the input
                    this.handleJoin(index, idInput.value, channelInput.value);
                });
            }

            if (leaveBtn) {
                leaveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLeave(index);
                });
            }
        });
    }

    async handleJoin(formIndex, id, channel) {
        if (!id || !channel) {
            alert('Please fill in both ID and Channel');
            return;
        }

        console.log(`Form ${formIndex + 1} - Join clicked:`, { id, channel });

        let token = null;
        try {
            // Fetch token from backend for both services
            const response = await fetch(`${URLs.backendURL}/api/agora/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ channelName: channel, uid: parseInt(id) }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch token: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            token = data.token;
            console.log("Fetched Agora Token:", token);

        } catch (error) {
            console.error("Error fetching Agora token:", error);
            alert("Failed to get Agora token. Check console for details.");
            return; // Stop execution if token fetching fails
        }
        
        if (formIndex === 0) {
            // First form - Agora Call
            console.log('Joining Agora Call...', { id, channel });
            this.agoraService.joinChannel(AgoraCredentials.AGORA_APP_ID, channel, token, id)
                .then(() => alert(`Successfully joined Agora Call in channel: ${channel}`))
                .catch(err => {
                    console.error("Failed to join Agora Call:", err);
                    alert("Failed to join Agora Call. Check console for details.");
                });
        } else if (formIndex === 1) {
            // Second form - Conversational AI
            console.log('Starting Conversational AI...', { id, channel });
            // The joinAndStartAgent method in ConversationalAIService expects the token
            this.convoAIService.joinAndStartAgent(channel, id, token)
                .then(() => alert(`Conversational AI agent started in channel: ${channel}`))
                .catch(err => {
                    console.error("Failed to start Conversational AI:", err);
                    alert("Failed to start Conversational AI. Check console for details.");
                });
        }
    }

    handleLeave(formIndex) {
        console.log(`Form ${formIndex + 1} - Leave clicked`);
        
        if (formIndex === 0) {
            // First form - Agora Call
            console.log('Leaving Agora Call...');
            this.agoraService.leaveChannel()
                .then(() => alert('Left Agora Call'))
                .catch(err => {
                    console.error("Failed to leave Agora Call:", err);
                    alert("Failed to leave Agora Call. Check console for details.");
                });
        } else if (formIndex === 1) {
            // Second form - Conversational AI
            console.log('Leaving Conversational AI...');
            this.convoAIService.leaveChannel()
                .then(() => alert('Left Conversational AI'))
                .catch(err => {
                    console.error("Failed to leave Conversational AI:", err);
                    alert("Failed to leave Conversational AI. Check console for details.");
                });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestCallController();
});
