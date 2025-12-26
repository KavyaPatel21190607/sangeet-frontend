import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Mic, Play, Heart, LogIn } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import { cn } from '../components/ui/utils';
import { trackService } from '../../services/trackService';
import { playlistService } from '../../services/playlistService';
import { spotifyService } from '../../services/spotifyService';
import { spotifyAuthService } from '../../services/spotifyAuthService';
import { toast } from 'sonner';

type FilterType = 'all' | 'songs' | 'podcasts' | 'artists' | 'albums' | 'playlists';

interface Track {
  _id: string;
  title: string;
  artist: string;
  album: string;
  coverImage: string;
  duration: string;
  category: 'song' | 'podcast';
  liked?: boolean;
}

interface Playlist {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  tracks: string[];
}

interface SearchPageProps {
  userType?: 'premium' | 'regular';
}

export const SearchPage = ({ userType = 'regular' }: SearchPageProps) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isFocused, setIsFocused] = useState(false);
  const { play, toggleLike } = usePlayer();
  const { isSpotifyAuthenticated, spotifyAccessToken, deviceId, loginWithSpotify, spotifyUser } = useSpotifyAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [spotifyTracks, setSpotifyTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'podcasts', label: 'Podcasts' },
    { id: 'artists', label: 'Artists' },
    { id: 'playlists', label: 'Playlists' },
  ];

  useEffect(() => {
    if (query.trim() === '') {
      setTracks([]);
      setSpotifyTracks([]);
      setPlaylists([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);

        // Search local database tracks (available to all users)
        const trackRes = await trackService.getTracks({ search: query, limit: 20 });
        setTracks(trackRes.data || []);

        // Search Spotify tracks (ONLY for Premium users)
        if (userType === 'premium') {
          try {
            const spotifyRes = await spotifyService.search(query, 10);
            console.log('Spotify search results:', spotifyRes);
            setSpotifyTracks(spotifyRes.tracks || []);
          } catch (spotifyError) {
            console.error('Spotify search error:', spotifyError);
            setSpotifyTracks([]);
          }
        } else {
          // Free users don't get Spotify results
          setSpotifyTracks([]);
        }

        // Search playlists
        if (filter === 'all' || filter === 'playlists') {
          const playlistRes = await playlistService.getMyPlaylists().catch(() => ({ data: [] }));
          setPlaylists((playlistRes.data || []).filter((p: Playlist) =>
            p.name.toLowerCase().includes(query.toLowerCase())
          ));
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, filter, userType]);

  const filteredTracks = tracks.filter(track => {
    if (filter === 'all') return true;
    if (filter === 'songs') return track.category === 'song';
    if (filter === 'podcasts') return track.category === 'podcast';
    return true;
  });

  const filteredPlaylists = filter === 'all' || filter === 'playlists' ? playlists : [];
  const filteredArtists: any[] = []; // Artists will come from Spotify API in future enhancement

  const hasResults = filteredTracks.length > 0 || filteredPlaylists.length > 0 || spotifyTracks.length > 0;

  return (
    <div className="space-y-6 pb-32">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "sticky top-0 z-30 -mx-8 px-8 py-6 backdrop-blur-3xl border-b transition-all",
          isFocused ? "bg-black/60 border-emerald-400/30" : "bg-black/40 border-white/10"
        )}
      >
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <motion.div
            animate={{
              scale: isFocused ? 1.02 : 1,
            }}
            className="relative"
          >
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What do you want to listen to?"
              className={cn(
                "w-full pl-12 pr-24 py-4 bg-white/5 border rounded-full outline-none transition-all",
                isFocused
                  ? "border-emerald-400 ring-4 ring-emerald-400/20 bg-white/10"
                  : "border-white/10 hover:bg-white/10"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => setQuery('')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              >
                <Mic className="w-5 h-5 text-black" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 justify-center mt-4 flex-wrap"
        >
          {filters.map((f) => (
            <motion.button
              key={f.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-2 rounded-full transition-all",
                filter === f.id
                  ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
              )}
            >
              {f.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {query === '' ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎵
            </motion.div>
            <h3 className="text-2xl mb-2">Start Searching</h3>
            <p className="text-gray-400">Find your favorite songs, podcasts, artists & more</p>
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </motion.div>
        ) : !hasResults ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-2xl mb-2">No Results Found</h3>
            <p className="text-gray-400">Try searching with different keywords</p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Artists */}
            {filteredArtists.length > 0 && (
              <section>
                <h2 className="text-xl mb-4">Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredArtists.map((artist, index) => (
                    <motion.div
                      key={artist.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group text-center cursor-pointer"
                    >
                      <div className="relative mb-3">
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full aspect-square rounded-full object-cover border-2 border-white/10 group-hover:border-emerald-400/50 transition-all"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                          </div>
                        </motion.div>
                      </div>
                      <h4 className="font-medium truncate">{artist.name}</h4>
                      <p className="text-sm text-gray-400">{artist.followers} followers</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {filteredPlaylists.length > 0 && (
              <section>
                <h2 className="text-xl mb-4">Playlists</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group backdrop-blur-xl bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="relative mb-3">
                        <img
                          src={playlist.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                          alt={playlist.name}
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute bottom-2 right-2"
                        >
                          <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                          </div>
                        </motion.div>
                      </div>
                      <h4 className="font-medium truncate mb-1">{playlist.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2">{playlist.description}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Spotify Tracks */}
            {spotifyTracks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl flex items-center gap-2">
                    <span>Spotify Tracks</span>
                    {isSpotifyAuthenticated ? (
                      <span className="text-xs px-2 py-1 bg-emerald-400/20 text-emerald-400 rounded-full">
                        Full Playback
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-purple-400/20 text-purple-400 rounded-full">
                        Preview Only
                      </span>
                    )}
                  </h2>
                  {!isSpotifyAuthenticated && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loginWithSpotify}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-black rounded-full font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      Login with Spotify
                    </motion.button>
                  )}
                </div>
                <div className="space-y-2">
                  {spotifyTracks.map((track, index) => (
                    <motion.div
                      key={track.spotifyId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ x: 4 }}
                      onClick={async () => {
                        if (isSpotifyAuthenticated && deviceId && spotifyAccessToken) {
                          // Play full track using Web Playback SDK
                          try {
                            await spotifyAuthService.playTrack(
                              deviceId,
                              `spotify:track:${track.spotifyId}`,
                              spotifyAccessToken
                            );
                            toast.success(`Playing ${track.title}`);
                          } catch (error: any) {
                            console.error('Playback error:', error);

                            if (error.message === 'PREMIUM_REQUIRED') {
                              toast.error('Spotify Premium required for playback');
                            } else if (error.message === 'TOKEN_EXPIRED') {
                              toast.error('Session expired. Please login again');
                            } else if (error.message === 'DEVICE_NOT_FOUND') {
                              toast.error('Playback device not found. Refresh the page');
                            } else {
                              toast.error('Failed to play track');
                            }
                          }
                        } else if (track.previewUrl) {
                          // Fallback to 30s preview
                          const audio = new Audio(track.previewUrl);
                          audio.play();
                          toast.info('Playing 30s preview');
                        } else {
                          toast.error('Preview not available');
                        }
                      }}
                      className="group flex items-center gap-4 p-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <img
                        src={track.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{track.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      {!track.previewUrl && !isSpotifyAuthenticated && (
                        <span className="text-xs px-2 py-1 bg-red-400/20 text-red-400 rounded">
                          No Preview
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{track.duration}</span>
                      <div className="flex items-center gap-2">
                        {!isSpotifyAuthenticated && track.previewUrl && (
                          <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Preview
                          </span>
                        )}
                        {isSpotifyAuthenticated && (
                          <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Full Track
                          </span>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className={`mt-4 p-4 border rounded-lg ${isSpotifyAuthenticated
                  ? 'bg-emerald-400/10 border-emerald-400/30'
                  : 'bg-purple-400/10 border-purple-400/30'
                  }`}>
                  <p className={`text-sm ${isSpotifyAuthenticated ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {isSpotifyAuthenticated ? (
                      <>
                        🎵 <strong>Full Playback Active:</strong> You're logged in as {spotifyUser?.displayName}.
                        {spotifyUser?.product === 'premium'
                          ? ' Click any track to play full songs!'
                          : ' Spotify Premium required for full playback.'}
                      </>
                    ) : (
                      <>
                        🎵 <strong>Preview Mode:</strong> Click any track to play a 30-second preview.
                        Login with Spotify for full playback!
                      </>
                    )}
                  </p>
                </div>
              </section>
            )}

            {/* Tracks */}
            {filteredTracks.length > 0 && (
              <section>
                <h2 className="text-xl mb-4">
                  {filter === 'songs' ? 'Songs' : filter === 'podcasts' ? 'Podcasts' : 'Your Library'}
                </h2>
                <div className="space-y-2">
                  {filteredTracks.map((track, index) => (
                    <motion.div
                      key={track._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ x: 4 }}
                      onClick={() => play(track)}
                      className="group flex items-center gap-4 p-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <img
                        src={track.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{track.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      {track.category === 'podcast' && (
                        <span className="px-2 py-1 bg-purple-400/20 text-purple-400 text-xs rounded">
                          PODCAST
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{track.duration}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track._id);
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
