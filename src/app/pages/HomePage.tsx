import { motion } from 'motion/react';
import { Play, TrendingUp, Clock, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useState, useEffect } from 'react';
import { trackService } from '../../services/trackService';
import { playlistService } from '../../services/playlistService';
import { toast } from 'sonner';

interface Track {
  _id: string;
  title: string;
  artist: string;
  album: string;
  coverImage: string;
  duration: string;
  category: 'song' | 'podcast';
  plays: number;
  likes: number;
  liked?: boolean;
}

interface Playlist {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  tracks: string[];
  isPublic: boolean;
}

export const HomePage = () => {
  const { play, toggleLike } = usePlayer();
  const [greeting, setGreeting] = useState('');
  const [gradientClass, setGradientClass] = useState('');
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [podcasts, setPodcasts] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
      setGradientClass('from-amber-900/40 via-black to-black');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
      setGradientClass('from-blue-900/40 via-black to-black');
    } else {
      setGreeting('Good Evening');
      setGradientClass('from-purple-900/40 via-black to-black');
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recentRes, trendingRes, playlistsRes] = await Promise.all([
        trackService.getRecentTracks(4),
        trackService.getTrendingTracks(8),
        playlistService.getMyPlaylists().catch(() => ({ data: [] })),
      ]);

      setRecentTracks(recentRes.data || []);

      const trending = trendingRes.data || [];
      setTrendingTracks(trending.filter((t: Track) => t.category === 'song'));
      setPodcasts(trending.filter((t: Track) => t.category === 'podcast'));

      setPlaylists(playlistsRes.data || []);
    } catch (error: any) {
      console.error('Error loading home data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-b ${gradientClass} -mx-8 -mt-8 px-8 pt-8 pb-12 mb-8`}
      >
        <h1 className="text-5xl mb-4">{greeting}</h1>
        <p className="text-gray-400 text-lg">Let's continue your journey</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      ) : (
        <>
          {/* Continue Listening */}
          {recentTracks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-2xl">Continue Listening</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentTracks.map((track, index) => (
                  <motion.div
                    key={track._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => play(track)}
                  >
                    <div className="relative mb-4">
                      <img
                        src={track.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                        alt={track.title}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-2 right-2"
                      >
                        <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/50">
                          <Play className="w-6 h-6 text-black fill-current ml-1" />
                        </div>
                      </motion.div>
                    </div>
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Daily Mixes */}
          {playlists.length > 0 && (
            <section>
              <h2 className="text-2xl mb-4">Your Playlists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {playlists.slice(0, 4).map((playlist, index) => (
                  <motion.div
                    key={playlist._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10 hover:border-emerald-400/30 transition-all cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <img
                        src={playlist.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                        alt={playlist.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-14 h-14 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/50"
                        >
                          <Play className="w-7 h-7 text-black fill-current ml-1" />
                        </motion.div>
                      </motion.div>
                    </div>
                    <h3 className="font-medium mb-1">{playlist.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{playlist.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{playlist.tracks.length} tracks</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Now */}
          {trendingTracks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h2 className="text-2xl">Trending Now</h2>
              </div>
              <div className="space-y-2">
                {trendingTracks.slice(0, 8).map((track, index) => (
                  <motion.div
                    key={track._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="group flex items-center gap-4 p-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => play(track)}
                  >
                    <span className="text-gray-500 w-6 text-center">{index + 1}</span>
                    <img
                      src={track.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{track.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <span className="text-sm text-gray-500">{track.duration}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleLike(track._id);
                          loadData(); // Reload to get updated liked status
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${track.liked ? 'text-emerald-400 fill-current' : 'text-gray-400 hover:text-emerald-400'}`} />
                      </motion.button>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center"
                      >
                        <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Podcasts */}
          {podcasts.length > 0 && (
            <section>
              <h2 className="text-2xl mb-4">Trending Podcasts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {podcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="group flex gap-4 p-4 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => play(podcast)}
                  >
                    <img
                      src={podcast.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                      alt={podcast.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-1 bg-purple-400/20 text-purple-400 text-xs rounded mb-2">
                        PODCAST
                      </span>
                      <h4 className="font-medium mb-1 truncate">{podcast.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{podcast.artist}</p>
                      <p className="text-xs text-gray-500 mt-2">{podcast.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleLike(podcast._id);
                          loadData(); // Reload to get updated liked status
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${podcast.liked ? 'text-emerald-400 fill-current' : 'text-gray-400 hover:text-emerald-400'}`} />
                      </motion.button>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center"
                      >
                        <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
