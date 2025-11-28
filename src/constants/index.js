export const AgoraCredentials = {
    AGORA_APP_ID : "2726042dfd394728824bad06e1257607", // This is generally safe to be public
    // IMPORTANT: AGORA_APP_CERT should NOT be exposed client-side.
    // It is used by the backend to generate tokens.
    // AGORA_TEMP_TOKEN is removed as tokens will be fetched dynamically.
}

export const URLs = {
    // Assuming your backend server is running on port 3001 to avoid conflict with Vite's port 3000
    backendURL : "http://localhost:3001"
}

/**
 * Fetches an Agora RTC token from the backend server.
 * @param {string} channelName - The name of the Agora channel.
 * @param {number} uid - The user ID for which to generate the token.
 * @returns {Promise<string>} The generated Agora token.
 * @throws {Error} If the token fetch fails.
 */
export async function fetchAgoraToken(channelName, uid) {
    try {
        const response = await fetch(`${URLs.backendURL}/api/agora/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channelName, uid }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch Agora token: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error("Error fetching Agora token:", error);
        throw error;
    }
}
