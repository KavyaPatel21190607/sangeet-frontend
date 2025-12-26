import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, List, Shuffle, Repeat } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useEffect, useState } from 'react';

interface SpotifyFullPlayerProps {
    currentTrack: any;
    isPaused: boolean;
    position: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    queue: any[];
    isFullPlayer: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSeek: (position: number) => void;
    onVolumeChange: (volume: number) => void;
    onToggleMute: () => void;
    onToggleFullPlayer: () => void;
    onToggleLike?: () => void;
    isLiked?: boolean;
    onShuffle?: () => void;
    onRepeat?: () => void;
    isShuffled?: boolean;
    repeatMode?: 'off' | 'track' | 'context';
}

export const SpotifyFullPlayer = ({
    currentTrack,
    isPaused,
    position,
    duration,
    volume,
    isMuted,
    queue,
    isFullPlayer,
    onTogglePlay,
    onNext,
    onPrevious,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onToggleFullPlayer,
    onToggleLike,
    isLiked = false,
    onShuffle,
    onRepeat,
    isShuffled = false,
    repeatMode = 'off',
}: SpotifyFullPlayerProps) => {
    const [showQueue, setShowQueue] = useState(false);
    const [visualizerBars, setVisualizerBars] = useState<number[]>([]);

    // Generate random visualizer bars
    useEffect(() => {
        if (!isPaused) {
            setVisualizerBars(Array(50).fill(10));
            return;
        }

        const interval = setInterval(() => {
            setVisualizerBars(Array(50).fill(0).map(() =>
                Math.random() * 100 + 20
            ));
        }, 100);

        return () => clearInterval(interval);
    }, [isPaused]);

    if (!currentTrack || !isFullPlayer) return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-gradient-to-br from-black via-purple-950/20 to-black backdrop-blur-3xl"
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleFullPlayer}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm uppercase tracking-wider text-gray-400">Now Playing</h3>
                            <div className="px-3 py-1 bg-emerald-400/20 rounded-full">
                                <span className="text-xs text-emerald-400 font-medium">Spotify</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowQueue(!showQueue)}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        >
                            <List className="w-6 h-6" />
                        </motion.button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-3xl mx-auto w-full">
                        {/* Album Art */}
                        <motion.div
                            animate={{ rotate: !isPaused ? 360 : 0 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="relative mb-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-purple-600/30 rounded-full blur-3xl" />
                            <motion.img
                                src={currentTrack.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                                alt={currentTrack.name}
                                className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl"
                                whileHover={{ scale: 1.02 }}
                            />
                        </motion.div>

                        {/* Track Info */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl md:text-4xl mb-2">{currentTrack.name}</h1>
                            <p className="text-xl text-gray-400">
                                {currentTrack.artists?.map((artist: any) => artist.name).join(', ')}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{currentTrack.album?.name}</p>
                        </div>

                        {/* Visualizer */}
                        <div className="w-full h-16 flex items-end justify-center gap-1 mb-8">
                            {visualizerBars.map((height, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-gradient-to-t from-emerald-400 to-cyan-400 rounded-full"
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full mb-2">
                            <div
                                className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percentage = (x / rect.width) * 100;
                                    const newPosition = (percentage / 100) * duration;
                                    onSeek(newPosition);
                                }}
                            >
                                <motion.div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ left: `${progress}%`, marginLeft: '-8px' }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>{formatTime(position)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mb-6">
                            {onShuffle && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onShuffle}
                                    className={cn(
                                        "p-2 transition-colors",
                                        isShuffled ? "text-emerald-400" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <Shuffle className="w-5 h-5" />
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onPrevious}
                                className="p-3 text-white hover:text-emerald-400 transition-colors"
                            >
                                <SkipBack className="w-7 h-7" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onTogglePlay}
                                className="p-5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg shadow-emerald-400/50"
                            >
                                {isPaused ? (
                                    <Play className="w-8 h-8 text-black fill-current ml-1" />
                                ) : (
                                    <Pause className="w-8 h-8 text-black fill-current" />
                                )}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onNext}
                                className="p-3 text-white hover:text-emerald-400 transition-colors"
                            >
                                <SkipForward className="w-7 h-7" />
                            </motion.button>

                            {onRepeat && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onRepeat}
                                    className={cn(
                                        "p-2 transition-colors",
                                        repeatMode !== 'off' ? "text-emerald-400" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <Repeat className="w-5 h-5" />
                                </motion.button>
                            )}
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center gap-6 w-full justify-center">
                            {onToggleLike && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onToggleLike}
                                    className={cn(
                                        "p-2 rounded-full transition-colors",
                                        isLiked ? "text-emerald-400" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                                </motion.button>
                            )}

                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onToggleMute}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </motion.button>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={isMuted ? 0 : volume * 100}
                                    onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                                    className="w-32 accent-emerald-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue Sidebar */}
                <AnimatePresence>
                    {showQueue && queue.length > 0 && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-2xl border-l border-white/10 p-6 overflow-y-auto"
                        >
                            <h3 className="text-xl mb-4">Queue</h3>
                            <div className="space-y-2">
                                {queue.map((track, index) => (
                                    <motion.div
                                        key={track.uri || index}
                                        whileHover={{ x: 4 }}
                                        className={cn(
                                            "p-3 rounded-lg cursor-pointer transition-colors",
                                            track.uri === currentTrack.uri
                                                ? "bg-emerald-400/20 border border-emerald-400/30"
                                                : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                                            <img
                                                src={track.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                                                alt={track.name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">{track.name}</p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {track.artists?.map((artist: any) => artist.name).join(', ')}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {formatTime(track.duration_ms)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};
