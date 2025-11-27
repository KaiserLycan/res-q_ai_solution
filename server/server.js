const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { RtcTokenBuilder, RtcRole } = require("agora-token");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
const agoraKey = process.env.AGORA_API_KEY;
const agoraSecret = process.env.AGORA_API_SECRET;

// --- Token Generation Endpoint ---
app.post('/api/agora/token', (req, res) => {
    const { channelName } = req.body;
    const uid = parseInt(req.body.uid, 10);

    console.log(`--- New Token Request ---`);
    console.log(`Channel Name: ${channelName}, Type: ${typeof channelName}`);
    console.log(`Received UID: ${req.body.uid}, Parsed UID: ${uid}, Type: ${typeof uid}`);

    if (!channelName || isNaN(uid)) {
        console.error("Validation Error: channelName or uid is invalid.");
        return res.status(400).json({ error: 'channelName and a valid numeric uid are required' });
    }
    if (!appId || !appCertificate) {
        console.error("Server Configuration Error: Agora App ID or App Certificate is missing from .env file.");
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log(`Generating token with AppID: ${appId.substring(0, 5)}... and AppCert: ${appCertificate.substring(0, 5)}...`);

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            RtcRole.PUBLISHER,
            privilegeExpiredTs
        );
        console.log("Token generated successfully.");
        res.json({ token });
    } catch (error) {
        console.error("!!! Token generation failed !!!", error);
        res.status(500).json({ error: 'Failed to generate token', details: error.message });
    }
});


function getAuthHeader () {
    const url = `${agoraKey}:${agoraSecret}`;
    return `Basic ${Buffer.from(url).toString('base64')}`;
}

app.post('/api/agora/convo-ai/start-agent', async (req, res) => {
    const {channel_name, remote_uid, token} = req.body;
    const url =`https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/join`;

    const data = {
        name: `agent-${Date.now()}`,
        properties: {
            channel: channel_name,
            token: token,
            agent_rtc_uid: "999",
            remote_rtc_uids: [remote_uid],
            enable_string_uid: false,
            idle_timeout: 120,
            llm: {
                url: "https://api.openai.com/v1/chat/completions",
                api_key: process.env.OPENAI_KEY,
                system_messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant."
                    }
                ],
                greeting_message: "Hello! I am your AI assistant. How can I help?",
                failure_message: "I am having trouble processing that.",
                params: { model: "gpt-4o-mini"}
            },
            // --- Reverting to Minimax TTS configuration ---
            tts: {
                vendor: "minimax",
                params: {
                    url: "wss://api.minimax.io/ws/v1/t2a_v2",
                    group_id: process.env.TTS_MINIMAX_GROUPID,
                    key: process.env.TTS_MINIMAX_KEY,
                    model: "speech-2.6-turbo",
                    voice_setting: {
                        voice_id: "English_Lively_Male_11",
                        speed: 1,
                        vol: 1,
                        pitch: 0,
                        emotion: "happy"
                    },
                    audio_setting: {
                        sample_rate: 160000,
                    },
                },
            }
        }
    }

    try {
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": getAuthHeader(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const json = await response.json();
        console.log("Agent Start Response:", json);
        res.json(json);
    }
    catch (err) {
        console.error("Agent Start Error:", err);
        res.status(500).json({error: err.message})
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
})