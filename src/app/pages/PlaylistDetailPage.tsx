import { motion } from 'motion/react';
import { ArrowLeft, Play, MoreVertical, Edit2, Trash2, Plus, Music, Mic, Globe, Lock, Heart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { playlistService } from '../../services/playlistService';
import { trackService } from '../../services/trackService';
import { usePlayer } from '../context/PlayerContext';
import { toast } from 'sonner';

interface Track {
    _id: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
    coverImage: string;
    audioUrl: string;
    category: 'song' | 'podcast';
    liked?: boolean;
}

interface Playlist {
    _id: string;
    name: string;
    description: string;
    coverImage: string;
    isPublic: boolean;
    owner: {
        _id: string;
        name: string;
    };
    tracks: Array<{
        track: Track;
        addedAt: string;
    }>;
}

export const PlaylistDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { play, setQueue, toggleLike } = usePlayer();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddTracksModal, setShowAddTracksModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(false);

    // Add tracks state
    const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (id) {
            loadPlaylist();
        }
    }, [id]);

    const loadPlaylist = async () => {
        try {
            setLoading(true);
            const response = await playlistService.getPlaylist(id!);
            setPlaylist(response.playlist);
            setEditName(response.playlist.name);
            setEditDescription(response.playlist.description);
            setEditIsPublic(response.playlist.isPublic);
        } catch (error) {
            console.error('Error loading playlist:', error);
            toast.error('Failed to load playlist');
            navigate('/playlists');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableTracks = async () => {
        try {
            const response = await trackService.getTracks({ limit: 100 });
            // Filter out tracks already in playlist
            const playlistTrackIds = new Set(playlist?.tracks.map(t => t.track._id) || []);
            const filtered = (response.data || []).filter((t: Track) => !playlistTrackIds.has(t._id));
            setAvailableTracks(filtered);
        } catch (error) {
            console.error('Error loading tracks:', error);
            toast.error('Failed to load tracks');
        }
    };

    const handlePlayTrack = (track: Track) => {
        const allTracks = playlist?.tracks.map(t => t.track) || [];
        setQueue(allTracks);
        play(track);
    };

    const handlePlayAll = () => {
        if (playlist && playlist.tracks.length > 0) {
            const allTracks = playlist.tracks.map(t => t.track);
            setQueue(allTracks);
            play(allTracks[0]);
        }
    };

    const handleEditPlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await playlistService.updatePlaylist(id!, {
                name: editName,
                description: editDescription,
                isPublic: editIsPublic
            });
            toast.success('Playlist updated!');
            setShowEditModal(false);
            loadPlaylist();
        } catch (error) {
            console.error('Error updating playlist:', error);
            toast.error('Failed to update playlist');
        }
    };

    const handleAddTracks = async () => {
        try {
            await Promise.all(
                Array.from(selectedTracks).map(trackId =>
                    playlistService.addTrack(id!, trackId)
                )
            );
            toast.success(`Added ${selectedTracks.size} tracks!`);
            setShowAddTracksModal(false);
            setSelectedTracks(new Set());
            loadPlaylist();
        } catch (error) {
            console.error('Error adding tracks:', error);
            toast.error('Failed to add tracks');
        }
    };

    const handleRemoveTrack = async (trackId: string) => {
        if (!confirm('Remove this track from playlist?')) return;

        try {
            await playlistService.removeTrack(id!, trackId);
            toast.success('Track removed!');
            loadPlaylist();
        } catch (error) {
            console.error('Error removing track:', error);
            toast.error('Failed to remove track');
        }
    };

    const handleDeletePlaylist = async () => {
        try {
            await playlistService.deletePlaylist(id!);
            toast.success('Playlist deleted!');
            navigate('/playlists');
        } catch (error) {
            console.error('Error deleting playlist:', error);
            toast.error('Failed to delete playlist');
        }
    };

    const toggleTrackSelection = (trackId: string) => {
        const newSelected = new Set(selectedTracks);
        if (newSelected.has(trackId)) {
            newSelected.delete(trackId);
        } else {
            newSelected.add(trackId);
        }
        setSelectedTracks(newSelected);
    };

    const filteredAvailableTracks = availableTracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!playlist) {
        return null;
    }

    return (
        <div className="space-y-6 pb-32">
            {/* Header */}
            <div className="flex items-start gap-6">
                <button
                    onClick={() => navigate('/playlists')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <img
                    src={playlist.coverImage || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400'}
                    alt={playlist.name}
                    className="w-48 h-48 rounded-xl object-cover shadow-2xl"
                />

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-5xl font-bold">{playlist.name}</h1>
                        {playlist.isPublic ? (
                            <Globe className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <p className="text-gray-400 mb-4">{playlist.description}</p>
                    <p className="text-sm text-gray-500 mb-6">
                        By {playlist.owner.name} • {playlist.tracks.length} tracks
                    </p>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePlayAll}
                            disabled={playlist.tracks.length === 0}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-full shadow-lg hover:shadow-emerald-400/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Play All
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowEditModal(true)}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                loadAvailableTracks();
                                setShowAddTracksModal(true);
                            }}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Tracks
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Tracks List */}
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-semibold">Tracks</h2>
                </div>

                {playlist.tracks.length === 0 ? (
                    <div className="text-center py-20">
                        <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No tracks in this playlist yet</p>
                        <button
                            onClick={() => {
                                loadAvailableTracks();
                                setShowAddTracksModal(true);
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-lg"
                        >
                            Add Tracks
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {playlist.tracks.map((item, index) => (
                            <motion.div
                                key={item.track._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="flex items-center gap-4 p-4 hover:bg-white/5 group transition-colors"
                            >
                                <span className="text-gray-400 w-8 text-center">{index + 1}</span>

                                <img
                                    src={item.track.coverImage}
                                    alt={item.track.title}
                                    className="w-12 h-12 rounded object-cover"
                                />

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.track.title}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-400 truncate">{item.track.artist}</p>
                                        {item.track.category === 'podcast' && (
                                            <Mic className="w-3 h-3 text-purple-400" />
                                        )}
                                    </div>
                                </div>

                                <span className="text-sm text-gray-400">{item.track.duration}</span>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLike(item.track._id);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Heart className={`w-4 h-4 ${item.track.liked ? 'text-emerald-400 fill-current' : 'text-gray-400 hover:text-emerald-400'}`} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePlayTrack(item.track)}
                                        className="p-2 hover:bg-emerald-400/20 rounded-lg transition-colors"
                                    >
                                        <Play className="w-4 h-4 text-emerald-400" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleRemoveTrack(item.track._id)}
                                        className="p-2 hover:bg-red-400/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 p-6"
                    >
                        <h3 className="text-2xl font-bold mb-4">Edit Playlist</h3>
                        <form onSubmit={handleEditPlaylist} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2">Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 outline-none resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="editPublic"
                                    checked={editIsPublic}
                                    onChange={(e) => setEditIsPublic(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="editPublic" className="text-sm">Make public</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Add Tracks Modal */}
            {showAddTracksModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddTracksModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-2xl max-h-[80vh] backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-2xl font-bold">Add Tracks</h3>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tracks..."
                                className="w-full mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 outline-none"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {filteredAvailableTracks.map((track) => (
                                <label
                                    key={track._id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTracks.has(track._id)}
                                        onChange={() => toggleTrackSelection(track._id)}
                                        className="w-4 h-4"
                                    />
                                    <img src={track.coverImage} alt={track.title} className="w-10 h-10 rounded" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{track.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                                    </div>
                                    {track.category === 'podcast' ? <Mic className="w-4 h-4 text-purple-400" /> : <Music className="w-4 h-4 text-emerald-400" />}
                                </label>
                            ))}
                        </div>
                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button
                                onClick={() => setShowAddTracksModal(false)}
                                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTracks}
                                disabled={selectedTracks.size === 0}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-lg disabled:opacity-50"
                            >
                                Add {selectedTracks.size} Tracks
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 p-6"
                    >
                        <h3 className="text-2xl font-bold mb-4">Delete Playlist?</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePlaylist}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
