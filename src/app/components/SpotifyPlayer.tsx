import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import { toast } from 'sonner';

declare global {
    interface Window {
        Spotify: any;
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

interface SpotifyPlayerProps {
    onReady?: (deviceId: string) => void;
}

export const SpotifyPlayer = ({ onReady }: SpotifyPlayerProps) => {
    const { spotifyAccessToken, setDeviceId, isSpotifyAuthenticated } = useSpotifyAuth();
    const [player, setPlayer] = useState<any>(null);
    const [isPaused, setIsPaused] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<any>(null);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        if (!isSpotifyAuthenticated || !spotifyAccessToken) {
            return;
        }

        // Load Spotify Web Playback SDK
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'Sangeet Web Player',
                getOAuthToken: (cb: (token: string) => void) => {
                    cb(spotifyAccessToken);
                },
                volume: 0.5,
            });

            // Error handling
            spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
                console.error('Initialization error:', message);
                toast.error('Failed to initialize Spotify player');
            });

            spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
                console.error('Authentication error:', message);
                toast.error('Spotify authentication failed');
            });

            spotifyPlayer.addListener('account_error', ({ message }: any) => {
                console.error('Account error:', message);
                toast.error('Spotify Premium required for playback');
            });

            spotifyPlayer.addListener('playback_error', ({ message }: any) => {
                console.error('Playback error:', message);
                toast.error('Playback failed');
            });

            // Ready
            spotifyPlayer.addListener('ready', ({ device_id }: any) => {
                console.log('Spotify Player Ready with Device ID:', device_id);
                setDeviceId(device_id);
                if (onReady) {
                    onReady(device_id);
                }
                toast.success('Spotify Player Ready!');
            });

            // Not Ready
            spotifyPlayer.addListener('not_ready', ({ device_id }: any) => {
                console.log('Device ID has gone offline:', device_id);
            });

            // Player state changed
            spotifyPlayer.addListener('player_state_changed', (state: any) => {
                if (!state) {
                    return;
                }

                setCurrentTrack(state.track_window.current_track);
                setIsPaused(state.paused);

                spotifyPlayer.getCurrentState().then((state: any) => {
                    setIsActive(!!state);
                });
            });

            spotifyPlayer.connect();
            setPlayer(spotifyPlayer);
            playerRef.current = spotifyPlayer;
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.disconnect();
            }
        };
    }, [spotifyAccessToken, isSpotifyAuthenticated, setDeviceId, onReady]);

    const togglePlay = () => {
        if (player) {
            player.togglePlay();
        }
    };

    const skipToNext = () => {
        if (player) {
            player.nextTrack();
        }
    };

    const skipToPrevious = () => {
        if (player) {
            player.previousTrack();
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        if (player) {
            player.setVolume(newVolume);
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (player) {
            if (isMuted) {
                player.setVolume(volume || 0.5);
                setIsMuted(false);
            } else {
                player.setVolume(0);
                setIsMuted(true);
            }
        }
    };

    if (!isSpotifyAuthenticated || !isActive || !currentTrack) {
        return null;
    }

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-20 left-0 right-0 z-40 backdrop-blur-3xl bg-black/60 border-t border-white/10 p-4"
        >
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                {/* Track Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                        src={currentTrack.album.images[0]?.url}
                        alt={currentTrack.name}
                        className="w-14 h-14 rounded object-cover"
                    />
                    <div className="min-w-0">
                        <h4 className="font-medium truncate">{currentTrack.name}</h4>
                        <p className="text-sm text-gray-400 truncate">
                            {currentTrack.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={skipToPrevious}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePlay}
                        className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center"
                    >
                        {isPaused ? (
                            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                        ) : (
                            <Pause className="w-5 h-5 text-black fill-current" />
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={skipToNext}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <SkipForward className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                        ) : (
                            <Volume2 className="w-5 h-5" />
                        )}
                    </motion.button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-24 accent-emerald-400"
                    />
                </div>

                {/* Spotify Badge */}
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-400/20 rounded-full">
                    <span className="text-xs text-emerald-400 font-medium">Spotify</span>
                </div>
            </div>
        </motion.div>
    );
};
