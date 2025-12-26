import { motion } from 'motion/react';
import { Heart, Play, Clock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { toast } from 'sonner';

interface Track {
  _id: string;
  title: string;
  artist: string;
  album: string;
  coverImage: string;
  duration: string;
}

export const LikedPage = () => {
  const { play } = usePlayer();
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedTracks();
  }, []);

  const loadLikedTracks = async () => {
    try {
      setLoading(true);
      const response = await userService.getLikedTracks();
      setLikedTracks(response.data || []);
    } catch (error) {
      console.error('Error loading liked tracks:', error);
      toast.error('Failed to load liked tracks');
    } finally {
      setLoading(false);
    }
  };

  const totalDuration = likedTracks.reduce((acc, track) => {
    const [mins, secs] = track.duration.split(':').map(Number);
    return acc + (mins * 60 + secs);
  }, 0);

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-emerald-900/40 via-black to-black -mx-8 -mt-8 px-8 pt-8 pb-12 mb-8"
      >
        <div className="flex items-end gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl blur-2xl opacity-50" />
            <div className="relative w-56 h-56 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center">
              <Heart className="w-28 h-28 text-white fill-current" />
            </div>
          </motion.div>

          <div>
            <p className="text-sm uppercase tracking-wider text-gray-400 mb-2">Playlist</p>
            <h1 className="text-5xl mb-4">Liked Songs</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{likedTracks.length} songs</span>
              <span>•</span>
              <span>{hours > 0 && `${hours} hr `}{minutes} min</span>
            </div>
          </div>
        </div>

        {/* Play Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => likedTracks.length > 0 && play(likedTracks[0])}
          className="mt-8 w-14 h-14 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/50 hover:shadow-emerald-400/70 transition-all"
        >
          <Play className="w-7 h-7 text-black fill-current ml-1" />
        </motion.button>
      </motion.div>

      {/* Tracks List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      ) : likedTracks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-2xl mb-2">No Liked Songs Yet</h3>
          <p className="text-gray-400">Start liking songs to build your collection</p>
        </motion.div>
      ) : (
        <div className="space-y-1">
          {/* Header Row */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-white/10">
            <span className="w-8">#</span>
            <span>Title</span>
            <span>Album</span>
            <Clock className="w-4 h-4" />
          </div>

          {/* Track Rows */}
          {likedTracks.map((track, index) => (
            <motion.div
              key={track._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onClick={() => play(track)}
              className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-3 rounded-lg cursor-pointer group"
            >
              <span className="w-8 text-gray-400 flex items-center">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play className="w-4 h-4 hidden group-hover:block text-emerald-400 fill-current" />
              </span>

              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={track.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-400 truncate">
                {track.album}
              </div>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Heart className="w-5 h-5 text-emerald-400 fill-current" />
                </motion.button>
                <span className="text-gray-400 w-12 text-right">{track.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
