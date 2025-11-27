/**
 * @file This file handles the Agora Real-Time Communication (RTC) service for audio calls.
 * It provides a class `AgoraCallService` to encapsulate the logic for joining, leaving,
 * and managing an audio call channel.
 */

import AgoraRTC from "agora-rtc-sdk-ng"
import {AgoraCredentials} from "../constants/index.js";

/**
 * @class AgoraCallService
 * @description A service class to manage Agora RTC audio calls.
 */
class AgoraCallService{
    constructor() {
        this.client = null;
        this.localAudioTrack = null;
        this.onConnectioStatChange = null;
    }

    _initializeClient() {
        if(!AgoraCredentials.AGORA_APP_ID) {
            console.error("Missing credentials");
            return;
        }

        this.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"})
        this.setupEnvironmentListeners();
    }

    /**
     * Joins an Agora channel with the provided credentials.
     * @param {string} appId - The Agora App ID.
     * @param {string} channel - The channel name to join.
     * @param {string} token - The Agora token for authentication.
     * @param {number | string} uid - The user ID.
     * @returns {Promise<void>}
     */
    async joinChannel(appId, channel, token, uid = null)
    {
        if(!this.client) {
            this._initializeClient();
        }

        try {
            // The UID is stored on the client object after joining.
            const joinedUID = await this.client.join(appId, channel, token, Number(uid));
            console.log(`User ${joinedUID} has joined the channel ${channel}`);
            
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: "speech_low_quality", //Optimize voice
            });
            await this.client.publish(this.localAudioTrack);
            console.log(`Publish success! User ${uid} has successfully joined ${channel} channel.`);
        }
        catch (error) {
            if(this.localAudioTrack) {
                this.localAudioTrack.close();
                this.localAudioTrack = null;
            }

            if(this.client) {
                await this.client.leave();
                this.client = null;
            }

            // Re-throw the error to be caught by the caller
            throw new Error("Failed to join the channel: " + error.message);
        }
    }

    /**
     * Leaves the current Agora channel.
     * @returns {Promise<void>}
     */
    async leaveChannel() {
        if(!this.client) {
            console.error("Client not initialized or already left");
            return;
        }

        try {
            if(this.localAudioTrack) {
                this.localAudioTrack.close()
                this.localAudioTrack = null;
            }

            let uid = this.client.uid;
            await this.client.leave();
            console.log(`Leave success! user ${uid} has successfully left the  channel.`)
        }
        catch (error) {
            console.error(error, "Failed to leave the channel");
        }
        finally {
            this.client=null;
        }
    }

    /**
     * Sets up listeners for Agora client events.
     */
    setupEnvironmentListeners() {
        // Event handler for when a remote user publishes a track.
        this.client.on("user-published", async (user, mediaType) => {
            // --- FIX: Do not subscribe to the local user's own stream ---
            if (user.uid === this.client.uid) {
                console.log("Skipping subscription to self.");
                return;
            }

            await this.client.subscribe(user, mediaType);
            console.log(`Subscribed to remote user: ${user.uid}`);

            if(mediaType === "audio") {
                const remoteAudioTrack = user.audioTrack;
                remoteAudioTrack.play();
            }
        });

        // Event handler for when a remote user unpublishes a track.
        this.client.on("user-unpublished", async (user, mediaType) => {
            console.log(`User ${user.uid} unpublished their ${mediaType} track.`);
        });


        // Event handler for when a remote user leaves the channel.
        this.client.on("user-left", (user) => {
            console.log(`${user.uid} has left the channel`)
        })

        // Event handler for connection state changes.
        this.client.on("connection-state-change", (curState, prev, reason) => {
            this.onConnectioStatChange?.(curState)
        })
    }

}

export default AgoraCallService;
