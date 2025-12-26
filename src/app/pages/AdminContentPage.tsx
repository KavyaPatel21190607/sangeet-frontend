import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Play, Music, Mic } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { adminService } from '../../services/adminService';
import { trackService } from '../../services/trackService';
import { toast } from 'sonner';

type ViewType = 'table' | 'grid';

interface Track {
  _id: string;
  title: string;
  artist: string;
  album: string;
  coverImage: string;
  category: 'song' | 'podcast';
  plays: number;
  likes: number;
}

export const AdminContentPage = () => {
  const [viewType, setViewType] = useState<ViewType>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'songs' | 'podcasts'>('all');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const response = await adminService.getTracks();
      console.log('Tracks response:', response);
      setTracks(response.data || []);
    } catch (error) {
      console.error('Error loading tracks:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      await trackService.deleteTrack(trackId);
      toast.success('Track deleted successfully');
      loadTracks();
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Failed to delete track');
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = searchQuery === '' ||
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'songs') return matchesSearch && track.category === 'song';
    if (filterType === 'podcasts') return matchesSearch && track.category === 'podcast';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl mb-2">Content Management</h1>
          <p className="text-gray-400">Manage all tracks and podcasts</p>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or artist..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          {(['all', 'songs', 'podcasts'] as const).map((type) => (
            <motion.button
              key={type}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-lg transition-all capitalize",
                filterType === type
                  ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              )}
            >
              {type}
            </motion.button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewType('table')}
            className={cn(
              "px-4 py-2 rounded-lg transition-all",
              viewType === 'table'
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            Table
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewType('grid')}
            className={cn(
              "px-4 py-2 rounded-lg transition-all",
              viewType === 'grid'
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            Grid
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <p className="text-sm text-gray-400 mb-1">Total Content</p>
              <p className="text-2xl">{filteredTracks.length}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <p className="text-sm text-gray-400 mb-1">Total Plays</p>
              <p className="text-2xl">
                {(filteredTracks.reduce((acc, t) => acc + t.plays, 0) / 1000000).toFixed(1)}M
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <p className="text-sm text-gray-400 mb-1">Avg. Plays</p>
              <p className="text-2xl">
                {(filteredTracks.reduce((acc, t) => acc + t.plays, 0) / filteredTracks.length / 1000).toFixed(0)}K
              </p>
            </motion.div>
          </div>

          {/* Content List/Grid */}
          {viewType === 'table' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-sm text-gray-400">Cover</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-400">Title</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-400">Artist</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-400">Type</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-400">Plays</th>
                      <th className="text-right px-4 py-3 text-sm text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.map((track, index) => (
                      <motion.tr
                        key={track._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        className="border-b border-white/10 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <img
                            src={track.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                            alt={track.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-xs">{track.title}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{track.artist}</td>
                        <td className="px-4 py-3">
                          {track.category === 'podcast' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-400/20 text-purple-400 text-xs rounded">
                              <Mic className="w-3 h-3" />
                              Podcast
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-400/20 text-emerald-400 text-xs rounded">
                              <Music className="w-3 h-3" />
                              Song
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {(track.plays / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(track._id)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                  className="group backdrop-blur-xl bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="relative mb-3">
                    <img
                      src={track.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                      alt={track.title}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {track.category === 'podcast' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-400/80 text-white text-xs rounded backdrop-blur-sm">
                          <Mic className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-400/80 text-white text-xs rounded backdrop-blur-sm">
                          <Music className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium text-sm truncate mb-1">{track.title}</h4>
                  <p className="text-xs text-gray-400 truncate mb-2">{track.artist}</p>
                  <p className="text-xs text-gray-500">{(track.plays / 1000000).toFixed(1)}M plays</p>

                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 p-2 bg-emerald-400/20 hover:bg-emerald-400/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 mx-auto text-emerald-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(track._id)}
                      className="flex-1 p-2 bg-red-400/20 hover:bg-red-400/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mx-auto text-red-400" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
