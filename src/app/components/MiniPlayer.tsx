import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Maximize2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../components/ui/utils';

export const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    pause,
    resume,
    next,
    previous,
    setProgress,
    setVolume,
    toggleFullPlayer,
    toggleLike,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-3xl bg-black/40 border-t border-white/10"
    >
      {/* Progress Bar */}
      <div className="relative h-1 bg-white/10 group cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setProgress(percentage);
      }}>
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
            src={currentTrack.coverImage || currentTrack.cover || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-lg object-cover shadow-lg"
            whileHover={{ scale: 1.05 }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">{currentTrack.title}</h4>
            <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleLike(currentTrack._id || currentTrack.id || '')}
            className={cn(
              "p-2 rounded-full transition-colors",
              currentTrack.liked ? "text-emerald-400" : "text-gray-400 hover:text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", currentTrack.liked && "fill-current")} />
          </motion.button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={previous}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? pause : resume}
            className="p-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg hover:shadow-emerald-400/50 transition-shadow"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-black fill-current" />
            ) : (
              <Play className="w-6 h-6 text-black fill-current" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Volume & Expand */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 accent-emerald-400"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullPlayer}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
