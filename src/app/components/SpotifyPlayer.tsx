import { useEffect, useState, useRef } from 'react';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import { usePlayerCoordinator } from '../context/PlayerCoordinatorContext';
import { toast } from 'sonner';
import { SpotifyMiniPlayer } from './SpotifyMiniPlayer';
import { SpotifyFullPlayer } from './SpotifyFullPlayer';

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
    const coordinator = usePlayerCoordinator();
    const [player, setPlayer] = useState<any>(null);
    const [isPaused, setIsPaused] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<any>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullPlayer, setIsFullPlayer] = useState(false);
    const [queue, setQueue] = useState<any[]>([]);
    const playerRef = useRef<any>(null);
    const positionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
                setPosition(state.position);
                setDuration(state.duration);

                // Update queue
                const nextTracks = state.track_window.next_tracks || [];
                setQueue([state.track_window.current_track, ...nextTracks]);

                // When Spotify starts playing, pause admin player (only if coordinator exists)
                if (!state.paused && coordinator) {
                    coordinator.pauseAdminPlayer();
                    coordinator.setActivePlayer('spotify');
                }

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
            if (positionIntervalRef.current) {
                clearInterval(positionIntervalRef.current);
            }
        };
    }, [spotifyAccessToken, isSpotifyAuthenticated, setDeviceId, onReady, coordinator]);

    // Register pause function with coordinator (only if coordinator exists)
    useEffect(() => {
        if (coordinator) {
            coordinator.registerSpotifyPause(() => {
                if (playerRef.current) {
                    playerRef.current.pause();
                }
            });
        }
    }, [coordinator]);

    // Update position every second when playing
    useEffect(() => {
        if (positionIntervalRef.current) {
            clearInterval(positionIntervalRef.current);
        }

        if (!isPaused && player) {
            positionIntervalRef.current = setInterval(() => {
                player.getCurrentState().then((state: any) => {
                    if (state) {
                        setPosition(state.position);
                    }
                });
            }, 1000);
        }

        return () => {
            if (positionIntervalRef.current) {
                clearInterval(positionIntervalRef.current);
            }
        };
    }, [isPaused, player]);

    const togglePlay = () => {
        if (player) {
            player.togglePlay();
            // When resuming Spotify, pause admin player (only if coordinator exists)
            if (isPaused && coordinator) {
                coordinator.pauseAdminPlayer();
                coordinator.setActivePlayer('spotify');
            }
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

    const handleSeek = (newPosition: number) => {
        if (player) {
            player.seek(newPosition).then(() => {
                setPosition(newPosition);
            });
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

    const toggleFullPlayer = () => {
        setIsFullPlayer(prev => !prev);
    };

    if (!isSpotifyAuthenticated || !isActive || !currentTrack) {
        return null;
    }

    return (
        <>
            {isFullPlayer ? (
                <SpotifyFullPlayer
                    currentTrack={currentTrack}
                    isPaused={isPaused}
                    position={position}
                    duration={duration}
                    volume={volume}
                    isMuted={isMuted}
                    queue={queue}
                    isFullPlayer={isFullPlayer}
                    onTogglePlay={togglePlay}
                    onNext={skipToNext}
                    onPrevious={skipToPrevious}
                    onSeek={handleSeek}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={toggleMute}
                    onToggleFullPlayer={toggleFullPlayer}
                />
            ) : (
                <SpotifyMiniPlayer
                    currentTrack={currentTrack}
                    isPaused={isPaused}
                    position={position}
                    duration={duration}
                    volume={volume}
                    isMuted={isMuted}
                    onTogglePlay={togglePlay}
                    onNext={skipToNext}
                    onPrevious={skipToPrevious}
                    onSeek={handleSeek}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={toggleMute}
                    onToggleFullPlayer={toggleFullPlayer}
                />
            )}
        </>
    );
};
