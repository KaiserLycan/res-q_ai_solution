import AgoraRTC from "agora-rtc-sdk-ng"
import {AgoraCredentials} from "../constants/index.js";


const appID = AgoraCredentials.AGORA_APP_ID;
const token = AgoraCredentials.AGORA_APP_CERT;
let _localAudioTrack = null;
// connection parameters
const channel = "test";
const uid = 0;

class AgoraCallService{
    constructor() {
        this.client = null;
        this.localAudioTrack = null;
        // call back to update the UI when the usr list or connection state change.
        this.onUserUpdate = null;
        this.onConnectioStatChange = null;
        // A map to store the remote users in the channel
        this.remoteUsers =new Map();
    }

    async _initializeClient() {
        if(!appID || !channel || !token) {
            console.error("Missing credentials");
            return;
        }

        this.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"})
        setupEnvironmentListeners();

    }

    async joinChannel(appID, channel, token, uid = null)

    }
}


function setupEnvironmentListeners() {
    //When published
    this.client.on("user-published", async (user, mediaType) => {
        await this.client.subscribe(user, mediaType);

        if(mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
        }
    });

    //When unpublished
    this.client.on("user-unpublished", async (user, mediaType) => {
        // Remote user unpublished
    });


    //When user leaves the call
    this.client.on("user-left", (user) => {
        console.log(`${user.uid} has left the channel`)
        if(this.remoteUsers.has(user.uid)) {
            this.remoteUsers.delete(user.uid);
            //Update the UI state
            this.onUserUpdate?.([...this.remoteUsers.keys()]);
        }
    })

    //State changes
    this.client.on("connection-state-change", (curState, prev, reason) => {
        this.onConnectioStatChange?.(curState)
    })
}

async function createLocalAudioTrack() {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
}

async function publishLocalAudio() {
    await _client.publish([_localAudioTrack]);
}

async function joinChannel() {
    await _client.join(appId, channel, token, uid);
    await createLocalAudioTrack();
    await publishLocalAudio();

    console.log(`Publish success! user ${uid} has successfully joined ${channel} channel.`);
}


async function leaveChannel() {
    _localAudioTrack.close();
    await _client.leave();
    console.log(`Leave success! user ${uid} has successfully left ${channel} channel.`)
}


///For future Implementations
//- initialize the client onload
