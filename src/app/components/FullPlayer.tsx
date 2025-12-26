import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Heart, List, Shuffle, Repeat } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../components/ui/utils';
import { useEffect, useState } from 'react';

export const FullPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    queue,
    isFullPlayer,
    pause,
    resume,
    next,
    previous,
    setProgress,
    setVolume,
    toggleFullPlayer,
    toggleLike,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([]);

  // Generate random visualizer bars
  useEffect(() => {
    if (!isPlaying) {
      setVisualizerBars(Array(50).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setVisualizerBars(Array(50).fill(0).map(() =>
        Math.random() * 100 + 20
      ));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentTrack || !isFullPlayer) return null;

  const currentTime = ((progress / 100) * parseDuration(currentTrack.duration)).toFixed(0);
  const formattedCurrentTime = formatTime(Number(currentTime));

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
              onClick={toggleFullPlayer}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </motion.button>
            <h3 className="text-sm uppercase tracking-wider text-gray-400">Now Playing</h3>
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
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-purple-600/30 rounded-full blur-3xl" />
              <motion.img
                src={currentTrack.coverImage || currentTrack.cover || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                alt={currentTrack.title}
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl"
                whileHover={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Track Info */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl mb-2">{currentTrack.title}</h1>
              <p className="text-xl text-gray-400">{currentTrack.artist}</p>
              <p className="text-sm text-gray-500 mt-1">{currentTrack.album}</p>
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
                  setProgress(percentage);
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
                <span>{formattedCurrentTime}</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={previous}
                className="p-3 text-white hover:text-emerald-400 transition-colors"
              >
                <SkipBack className="w-7 h-7" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={isPlaying ? pause : resume}
                className="p-5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg shadow-emerald-400/50"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-black fill-current" />
                ) : (
                  <Play className="w-8 h-8 text-black fill-current ml-1" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={next}
                className="p-3 text-white hover:text-emerald-400 transition-colors"
              >
                <SkipForward className="w-7 h-7" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Repeat className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center gap-6 w-full justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleLike(currentTrack._id || currentTrack.id || '')}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  currentTrack.liked ? "text-emerald-400" : "text-gray-400 hover:text-white"
                )}
              >
                <Heart className={cn("w-6 h-6", currentTrack.liked && "fill-current")} />
              </motion.button>

              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-32 accent-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Queue Sidebar */}
        <AnimatePresence>
          {showQueue && (
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
                    key={track._id || track.id}
                    whileHover={{ x: 4 }}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      (track._id || track.id) === (currentTrack._id || currentTrack.id)
                        ? "bg-emerald-400/20 border border-emerald-400/30"
                        : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                      <img
                        src={track.coverImage || track.cover || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{track.title}</p>
                        <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-gray-500">{track.duration}</span>
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

function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
