import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { spotifyAuthService } from '../../services/spotifyAuthService';
import { toast } from 'sonner';

interface SpotifyUser {
    id: string;
    displayName: string;
    email: string;
    product: string; // 'premium' or 'free'
    images: any[];
    country?: string;
}

interface SpotifyAuthContextType {
    isSpotifyAuthenticated: boolean;
    spotifyAccessToken: string | null;
    spotifyRefreshToken: string | null;
    spotifyUser: SpotifyUser | null;
    deviceId: string | null;
    loginWithSpotify: () => void;
    handleSpotifyCallback: (code: string) => Promise<void>;
    logoutSpotify: () => void;
    setDeviceId: (id: string) => void;
}

const SpotifyAuthContext = createContext<SpotifyAuthContextType | undefined>(undefined);

export const useSpotifyAuth = () => {
    const context = useContext(SpotifyAuthContext);
    if (!context) {
        throw new Error('useSpotifyAuth must be used within SpotifyAuthProvider');
    }
    return context;
};

interface SpotifyAuthProviderProps {
    children: ReactNode;
}

export const SpotifyAuthProvider = ({ children }: SpotifyAuthProviderProps) => {
    const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
    const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(null);
    const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(null);
    const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    // Load tokens from localStorage on mount
    useEffect(() => {
        const accessToken = localStorage.getItem('spotify_access_token');
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        const user = localStorage.getItem('spotify_user');

        console.log('Loading Spotify data from localStorage:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            userDataRaw: user
        });

        if (accessToken && refreshToken) {
            setSpotifyAccessToken(accessToken);
            setSpotifyRefreshToken(refreshToken);
            setIsSpotifyAuthenticated(true);

            if (user) {
                try {
                    const parsedUser = JSON.parse(user);
                    console.log('Parsed Spotify user:', parsedUser);
                    setSpotifyUser(parsedUser);
                } catch (error) {
                    console.error('Failed to parse Spotify user data:', error);
                    localStorage.removeItem('spotify_user');
                }
            }

            // Check if token needs refresh
            checkAndRefreshToken(refreshToken);
        }
    }, []);

    // Auto-refresh token before expiration
    const checkAndRefreshToken = async (refreshToken: string) => {
        const tokenExpiry = localStorage.getItem('spotify_token_expiry');
        if (tokenExpiry) {
            const expiryTime = parseInt(tokenExpiry);
            const now = Date.now();

            // Refresh if token expires in less than 5 minutes
            if (now >= expiryTime - 5 * 60 * 1000) {
                await refreshAccessToken(refreshToken);
            }
        }
    };

    const refreshAccessToken = async (refreshToken: string) => {
        try {
            const response = await spotifyAuthService.refreshToken(refreshToken);

            if (response.success) {
                setSpotifyAccessToken(response.accessToken);
                localStorage.setItem('spotify_access_token', response.accessToken);

                const expiryTime = Date.now() + response.expiresIn * 1000;
                localStorage.setItem('spotify_token_expiry', expiryTime.toString());

                // Schedule next refresh
                setTimeout(() => refreshAccessToken(refreshToken), (response.expiresIn - 300) * 1000);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            logoutSpotify();
        }
    };

    const loginWithSpotify = async () => {
        try {
            console.log('Initiating Spotify login...');
            const response = await spotifyAuthService.initiateLogin();
            console.log('Spotify login response:', response);

            if (response.success && response.authorizeURL) {
                console.log('Redirecting to:', response.authorizeURL);
                // Redirect to Spotify authorization
                window.location.href = response.authorizeURL;
            } else {
                console.error('Invalid response from login endpoint:', response);
                toast.error('Failed to get Spotify authorization URL');
            }
        } catch (error: any) {
            console.error('Spotify login error:', error);
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to initiate Spotify login: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSpotifyCallback = async (code: string) => {
        try {
            console.log('Starting Spotify callback with code:', code);
            const response = await spotifyAuthService.handleCallback(code);
            console.log('Callback response:', response);

            if (response.success) {
                // Store tokens
                setSpotifyAccessToken(response.accessToken);
                setSpotifyRefreshToken(response.refreshToken);
                setIsSpotifyAuthenticated(true);

                localStorage.setItem('spotify_access_token', response.accessToken);
                localStorage.setItem('spotify_refresh_token', response.refreshToken);

                const expiryTime = Date.now() + response.expiresIn * 1000;
                localStorage.setItem('spotify_token_expiry', expiryTime.toString());

                console.log('Tokens stored, now fetching user profile...');

                // Get user profile
                try {
                    const userResponse = await spotifyAuthService.getUserProfile(response.accessToken);
                    console.log('User profile response:', userResponse);

                    if (userResponse.success && userResponse.user) {
                        console.log('Setting Spotify user:', userResponse.user);
                        setSpotifyUser(userResponse.user);
                        localStorage.setItem('spotify_user', JSON.stringify(userResponse.user));
                        console.log('Spotify user saved to localStorage');

                        // Check if user has Premium
                        if (userResponse.user.product !== 'premium') {
                            toast.warning('Spotify Premium required for full playback');
                        } else {
                            toast.success(`Welcome, ${userResponse.user.displayName}!`);
                        }
                    } else {
                        console.error('User profile fetch failed:', userResponse);
                        toast.error('Failed to load Spotify profile');
                    }
                } catch (profileError) {
                    console.error('Error fetching user profile:', profileError);
                    toast.error('Failed to load Spotify profile');
                }

                // Schedule token refresh
                setTimeout(() => refreshAccessToken(response.refreshToken), (response.expiresIn - 300) * 1000);
            }
        } catch (error) {
            console.error('Spotify callback error:', error);
            toast.error('Failed to authenticate with Spotify');
        }
    };

    const logoutSpotify = () => {
        setIsSpotifyAuthenticated(false);
        setSpotifyAccessToken(null);
        setSpotifyRefreshToken(null);
        setSpotifyUser(null);
        setDeviceId(null);

        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_user');
        localStorage.removeItem('spotify_token_expiry');

        toast.info('Logged out from Spotify');
    };

    const value = {
        isSpotifyAuthenticated,
        spotifyAccessToken,
        spotifyRefreshToken,
        spotifyUser,
        deviceId,
        loginWithSpotify,
        handleSpotifyCallback,
        logoutSpotify,
        setDeviceId,
    };

    return (
        <SpotifyAuthContext.Provider value={value}>
            {children}
        </SpotifyAuthContext.Provider>
    );
};
