import api from './api';

export const spotifyAuthService = {
    // Initiate Spotify login
    initiateLogin: async () => {
        const response = await api.get('/spotify-auth/login');
        return response.data;
    },

    // Handle OAuth callback
    handleCallback: async (code: string) => {
        const response = await api.post('/spotify-auth/callback', { code });
        return response.data;
    },

    // Refresh access token
    refreshToken: async (refreshToken: string) => {
        const response = await api.post('/spotify-auth/refresh', { refreshToken });
        return response.data;
    },

    // Get user profile
    getUserProfile: async (accessToken: string) => {
        const response = await api.get('/spotify-auth/me', {
            params: { accessToken },
        });
        return response.data;
    },

    // Play track on Spotify device
    playTrack: async (deviceId: string, trackUri: string, accessToken: string) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    uris: [trackUri],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 403) {
                    throw new Error('PREMIUM_REQUIRED');
                } else if (response.status === 401) {
                    throw new Error('TOKEN_EXPIRED');
                } else if (response.status === 404) {
                    throw new Error('DEVICE_NOT_FOUND');
                } else {
                    throw new Error(errorData.error?.message || 'Failed to play track');
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Play track error:', error);
            throw error;
        }
    },

    // Pause playback
    pausePlayback: async (deviceId: string, accessToken: string) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to pause playback');
            }

            return { success: true };
        } catch (error) {
            console.error('Pause playback error:', error);
            throw error;
        }
    },

    // Resume playback
    resumePlayback: async (deviceId: string, accessToken: string) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to resume playback');
            }

            return { success: true };
        } catch (error) {
            console.error('Resume playback error:', error);
            throw error;
        }
    },
};
