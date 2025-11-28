/**
 * @file This module provides a service for interacting with the Conversational AI agent
 * via Agora RTC and a backend service.
 */

import AgoraRTC from "agora-rtc-sdk-ng";
import { AgoraCredentials, URLs } from "../constants/index.js";

/**
 * @class ConversationalAIService
 * @description Manages the connection to the conversational AI agent.
 */
export class ConversationalAIService {
    /**
     * @param {string} appId - The Agora App ID.
     */
    constructor(appId) {
        if (!appId) {
            throw new Error("Agora App ID is required.");
        }
        this.appId = appId;
        this.client = AgoraRTC.createClient({
            mode: "rtc",
            codec: "vp8"
        });
        this.localAudioTrack = null;

        // Bind methods to ensure 'this' context is correct
        this._handleUserPublished = this._handleUserPublished.bind(this);
        
        // Set up listener for remote users immediately after client creation
        this.client.on("user-published", this._handleUserPublished);
        this.client.on("user-unpublished", (user, mediaType) => {
            console.log(`User ${user.uid} unpublished their ${mediaType} track.`);
        });
        this.client.on("user-left", (user) => {
            console.log(`User ${user.uid} left the channel.`);
        });
        this.client.on("connection-state-change", (curState, prevState, reason) => {
            console.log(`Connection state changed from ${prevState} to ${curState}. Reason: ${reason}`);
        });
    }

    /**
     * Joins an Agora channel, publishes the local audio, and sends a request
     * to the backend to start the AI agent.
     * @param {string} channelName - The name of the channel to join.
     * @param {string} uid - The user ID for the client.
     * @param {string} token - The Agora token for authentication.
     * @returns {Promise<void>}
     */
    async joinAndStartAgent(channelName, uid, token) {
        if (!channelName || !uid || !token) {
            throw new Error("Channel name, UID, and token are required to join.");
        }

        try {
            // Join the Agora channel
            await this.client.join(this.appId, channelName, token, uid);
            console.log(`Successfully joined channel ${channelName} with UID ${uid}`);

            // Create and publish microphone audio track
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            await this.client.publish(this.localAudioTrack);
            console.log("Successfully published local audio track.");

            // Make API call to backend to start the conversational AI agent
            console.log("Requesting backend to start AI agent...");
            const response = await fetch(`${URLs.backendURL}/api/agora/convo-ai/start-agent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    channel_name: channelName,
                    remote_uid: uid,
                    token: token
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Backend request failed: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            console.log("Backend response:", data);

        } catch (error) {
            console.error("Error in joinAndStartAgent:", error);
            // Clean up in case of error
            if (this.localAudioTrack) {
                this.localAudioTrack.close();
                this.localAudioTrack = null;
            }
            if (this.client.connectionState === 'CONNECTED' || this.client.connectionState === 'CONNECTING') {
                await this.client.leave();
            }
            // Re-throw the error to allow the caller to handle it
            throw error;
        }
    }

    /**
     * Handles the "user-published" event from the Agora client.
     * @private
     * @param {IAgoraRTCRemoteUser} user - The remote user who published.
     * @param {"audio" | "video"} mediaType - The type of media published.
     */
    async _handleUserPublished(user, mediaType) {
        console.log(`User ${user.uid} published ${mediaType} track.`);
        await this.client.subscribe(user, mediaType);
        console.log(`Subscribed to user ${user.uid} (${mediaType})`);
        if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            if (remoteAudioTrack) {
                remoteAudioTrack.play();
                console.log(`Playing audio from user ${user.uid}`);
            } else {
                console.warn(`Audio track not found for user ${user.uid} despite mediaType being audio.`);
            }
        }
    }

    /**
     * Leaves the Agora channel and cleans up resources.
     * @returns {Promise<void>}
     */
    async leaveChannel() {
        try {
            if (this.localAudioTrack) {
                this.localAudioTrack.stop();
                this.localAudioTrack.close();
                this.localAudioTrack = null;
            }

            // Remove event listeners
            this.client.off("user-published", this._handleUserPublished);
            this.client.off("user-unpublished");
            this.client.off("user-left");
            this.client.off("connection-state-change");


            if (this.client.connectionState === 'CONNECTED') {
                await this.client.leave();
                console.log("Successfully left the channel.");
            }
        } catch (error) {
            console.error("Error leaving channel:", error);
        }
    }
}
