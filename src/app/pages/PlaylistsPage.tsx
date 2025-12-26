import { motion } from 'motion/react';
import { Plus, Play, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistService } from '../../services/playlistService';
import { toast } from 'sonner';
import { CreatePlaylistDialog } from '../components/CreatePlaylistDialog';

interface Playlist {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  tracks: any[];
}

export const PlaylistsPage = () => {
  const { play } = usePlayer();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistService.getMyPlaylists();
      console.log('Playlists response:', response);
      console.log('Playlists data:', response.data);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = () => {
    setShowCreateDialog(true);
  };

  const handleDialogSuccess = () => {
    loadPlaylists();
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlists/${playlistId}`);
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-4xl">Your Playlists</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreatePlaylist}
          className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-full shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </motion.button>
      </motion.div>

      {/* Playlists Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => handlePlaylistClick(playlist._id)}
              className="group backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="relative mb-4">
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
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playlist.tracks.length > 0) play(playlist.tracks[0]);
                    }}
                    className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/50"
                  >
                    <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                  </motion.button>
                </motion.div>
              </div>

              <h3 className="font-medium mb-1 truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-2">{playlist.description}</p>
              <p className="text-xs text-gray-500">{playlist.tracks.length} tracks</p>
            </motion.div>
          ))}

          {/* Create New Playlist Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: playlists.length * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={handleCreatePlaylist}
            className="group backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-dashed border-white/20 hover:border-emerald-400/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center aspect-square"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-400/20 transition-colors"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-emerald-400" />
            </motion.div>
            <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Create New Playlist</p>
          </motion.div>
        </div>
      )}

      {/* Recently Played Playlists */}
      {!loading && playlists.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl mb-4">Recently Played</h2>
          <div className="space-y-2">
            {playlists.slice(0, 3).map((playlist, index) => (
              <motion.div
                key={`recent-${playlist._id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className="group flex items-center gap-4 p-4 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <img
                  src={playlist.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                  alt={playlist.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1 truncate">{playlist.name}</h4>
                  <p className="text-sm text-gray-400 truncate">{playlist.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{playlist.tracks.length} tracks</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playlist.tracks.length > 0 && play(playlist.tracks[0])}
                    className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Create Playlist Dialog */}
      <CreatePlaylistDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};
