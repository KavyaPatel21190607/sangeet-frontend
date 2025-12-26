import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { userService } from '../../services/userService';
import { usePlayerCoordinator } from './PlayerCoordinatorContext';

interface Track {
  _id?: string;
  id?: string;
  title: string;
  artist: string;
  album?: string;
  coverImage?: string;
  cover?: string;
  duration: string;
  audioUrl?: string;
  category?: 'song' | 'podcast';
  liked?: boolean;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Track[];
  isFullPlayer: boolean;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  toggleFullPlayer: () => void;
  toggleLike: (trackId: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isFullPlayer, setIsFullPlayer] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const coordinator = usePlayerCoordinator();

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    setAudioElement(audio);

    // Cleanup
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Register pause function with coordinator (only if coordinator exists)
  useEffect(() => {
    if (coordinator) {
      coordinator.registerAdminPause(() => {
        setIsPlaying(false);
      });
    }
  }, [coordinator]);

  // Update audio source when track changes
  useEffect(() => {
    if (!audioElement || !currentTrack) return;

    const audioUrl = currentTrack.audioUrl;
    if (audioUrl) {
      audioElement.src = audioUrl;
      if (isPlaying) {
        audioElement.play().catch(err => console.error('Error playing audio:', err));
      }
    }
  }, [currentTrack, audioElement]);

  // Handle play/pause
  useEffect(() => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.play().catch(err => console.error('Error playing audio:', err));
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  // Update volume
  useEffect(() => {
    if (!audioElement) return;
    audioElement.volume = volume / 100;
  }, [volume, audioElement]);

  // Track progress
  useEffect(() => {
    if (!audioElement) return;

    const updateProgress = () => {
      if (audioElement.duration) {
        const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
        setProgress(progressPercent);
      }
    };

    const handleEnded = () => {
      next();
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, queue]);

  const play = async (track: Track) => {
    // Pause Spotify player if coordinator is available
    if (coordinator) {
      coordinator.pauseSpotifyPlayer();
      coordinator.setActivePlayer('admin');
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    if (!queue.includes(track)) {
      setQueue(prev => [...prev, track]);
    }

    // Track play count in backend
    const trackId = track._id || track.id;
    if (trackId) {
      try {
        await userService.playTrack(trackId);
      } catch (error) {
        console.error('Error tracking play:', error);
      }
    }
  };

  const pause = () => setIsPlaying(false);

  const resume = () => {
    // Pause Spotify player when resuming admin player (only if coordinator exists)
    if (coordinator) {
      coordinator.pauseSpotifyPlayer();
      coordinator.setActivePlayer('admin');
    }
    setIsPlaying(true);
  };

  const getTrackId = (track: Track) => track._id || track.id || '';

  const next = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => getTrackId(t) === getTrackId(currentTrack!));
    const nextIndex = (currentIndex + 1) % queue.length;
    play(queue[nextIndex]);
  };

  const previous = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => getTrackId(t) === getTrackId(currentTrack!));
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    play(queue[prevIndex]);
  };

  const handleSetProgress = (newProgress: number) => {
    if (!audioElement || !audioElement.duration) return;
    const newTime = (newProgress / 100) * audioElement.duration;
    audioElement.currentTime = newTime;
    setProgress(newProgress);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const toggleFullPlayer = () => {
    setIsFullPlayer(prev => !prev);
  };

  const toggleLike = async (trackId: string) => {
    try {
      await userService.likeTrack(trackId);

      if (getTrackId(currentTrack!) === trackId) {
        // Toggle in UI - actual state managed by backend
        setCurrentTrack(prev => prev ? { ...prev } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        queue,
        isFullPlayer,
        play,
        pause,
        resume,
        next,
        previous,
        setProgress: handleSetProgress,
        setVolume,
        setQueue,
        addToQueue,
        toggleFullPlayer,
        toggleLike,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
