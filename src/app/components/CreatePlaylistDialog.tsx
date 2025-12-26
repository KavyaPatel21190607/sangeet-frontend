import { motion, AnimatePresence } from 'motion/react';
import { X, Music, Mic, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackService } from '../../services/trackService';
import { playlistService } from '../../services/playlistService';
import { toast } from 'sonner';

interface Track {
    _id: string;
    title: string;
    artist: string;
    coverImage: string;
    category: 'song' | 'podcast';
}

interface CreatePlaylistDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreatePlaylistDialog = ({ isOpen, onClose, onSuccess }: CreatePlaylistDialogProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingTracks, setLoadingTracks] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadTracks();
        } else {
            // Reset form when dialog closes
            setName('');
            setDescription('');
            setIsPublic(false);
            setSelectedTracks(new Set());
            setSearchQuery('');
        }
    }, [isOpen]);

    const loadTracks = async () => {
        try {
            setLoadingTracks(true);
            const response = await trackService.getTracks({ limit: 100 });
            setTracks(response.data || []);
        } catch (error) {
            console.error('Error loading tracks:', error);
            toast.error('Failed to load tracks');
        } finally {
            setLoadingTracks(false);
        }
    };

    const toggleTrack = (trackId: string) => {
        const newSelected = new Set(selectedTracks);
        if (newSelected.has(trackId)) {
            newSelected.delete(trackId);
        } else {
            newSelected.add(trackId);
        }
        setSelectedTracks(newSelected);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a playlist name');
            return;
        }

        try {
            setLoading(true);

            // Create playlist
            const playlistResponse = await playlistService.createPlaylist({
                name: name.trim(),
                description: description.trim(),
                isPublic
            });

            // Add selected tracks to playlist
            if (selectedTracks.size > 0) {
                const playlistId = playlistResponse.playlist._id;
                await Promise.all(
                    Array.from(selectedTracks).map(trackId =>
                        playlistService.addTrack(playlistId, trackId)
                    )
                );
            }

            toast.success(`Playlist "${name}" created with ${selectedTracks.size} tracks!`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating playlist:', error);
            toast.error('Failed to create playlist');
        } finally {
            setLoading(false);
        }
    };

    const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-2xl font-bold">Create New Playlist</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Playlist Name */}
                            <div>
                                <label className="block text-sm mb-2 text-gray-300">Playlist Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My Awesome Playlist"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm mb-2 text-gray-300">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your playlist..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Public Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-400 focus:ring-emerald-400/20"
                                />
                                <label htmlFor="isPublic" className="text-sm text-gray-300 cursor-pointer">
                                    Make this playlist public
                                </label>
                            </div>

                            {/* Track Selection */}
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm text-gray-300">
                                        Add Tracks ({selectedTracks.size} selected)
                                    </label>
                                </div>

                                {/* Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search tracks..."
                                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                                    />
                                </div>

                                {/* Track List */}
                                <div className="max-h-64 overflow-y-auto space-y-2 bg-white/5 rounded-lg p-3">
                                    {loadingTracks ? (
                                        <p className="text-center text-gray-400 py-8">Loading tracks...</p>
                                    ) : filteredTracks.length === 0 ? (
                                        <p className="text-center text-gray-400 py-8">No tracks found</p>
                                    ) : (
                                        filteredTracks.map((track) => (
                                            <label
                                                key={track._id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTracks.has(track._id)}
                                                    onChange={() => toggleTrack(track._id)}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-400 focus:ring-emerald-400/20"
                                                />
                                                <img
                                                    src={track.coverImage}
                                                    alt={track.title}
                                                    className="w-10 h-10 rounded object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm truncate">{track.title}</p>
                                                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                                                </div>
                                                {track.category === 'podcast' ? (
                                                    <Mic className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                ) : (
                                                    <Music className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                )}
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-lg shadow-lg hover:shadow-emerald-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Playlist'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
