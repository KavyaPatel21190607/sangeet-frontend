import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Maximize2 } from 'lucide-react';
import { cn } from '../components/ui/utils';

interface SpotifyMiniPlayerProps {
    currentTrack: any;
    isPaused: boolean;
    position: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSeek: (position: number) => void;
    onVolumeChange: (volume: number) => void;
    onToggleMute: () => void;
    onToggleFullPlayer: () => void;
    onToggleLike?: () => void;
    isLiked?: boolean;
}

export const SpotifyMiniPlayer = ({
    currentTrack,
    isPaused,
    position,
    duration,
    volume,
    isMuted,
    onTogglePlay,
    onNext,
    onPrevious,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onToggleFullPlayer,
    onToggleLike,
    isLiked = false,
}: SpotifyMiniPlayerProps) => {
    if (!currentTrack) return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-3xl bg-black/40 border-t border-white/10"
        >
            {/* Progress Bar */}
            <div
                className="relative h-1 bg-white/10 group cursor-pointer"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = (x / rect.width) * 100;
                    const newPosition = (percentage / 100) * duration;
                    onSeek(newPosition);
                }}
            >
                <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{ width: `${progress}%` }}
                />
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${progress}%`, marginLeft: '-6px' }}
                />
            </div>

            <div className="px-4 py-3 flex items-center gap-4">
                {/* Track Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <motion.img
                        src={currentTrack.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                        alt={currentTrack.name}
                        className="w-12 h-12 rounded-lg object-cover shadow-lg"
                        whileHover={{ scale: 1.05 }}
                    />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{currentTrack.name}</h4>
                        <p className="text-sm text-gray-400 truncate">
                            {currentTrack.artists?.map((artist: any) => artist.name).join(', ')}
                        </p>
                    </div>
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
                            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                        </motion.button>
                    )}
                </div>

                {/* Time Display */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatTime(position)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onPrevious}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onTogglePlay}
                        className="p-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg hover:shadow-emerald-400/50 transition-shadow"
                    >
                        {isPaused ? (
                            <Play className="w-6 h-6 text-black fill-current" />
                        ) : (
                            <Pause className="w-6 h-6 text-black fill-current" />
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNext}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <SkipForward className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Volume & Expand */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
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
                            className="w-24 accent-emerald-400"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleFullPlayer}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </motion.button>

                    {/* Spotify Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-400/20 rounded-full">
                        <span className="text-xs text-emerald-400 font-medium">Spotify</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
