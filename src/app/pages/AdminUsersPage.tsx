import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Crown, User as UserIcon, Trash2, ArrowUpCircle, ArrowDownCircle, Shield } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

type ViewType = 'table' | 'grid';

interface User {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
    userType: 'regular' | 'premium';
    role: string;
    createdAt: string;
    listeningStats: {
        totalSongsPlayed: number;
        totalHoursListened: number;
    };
    subscription?: {
        status: string;
        endDate?: string;
    };
}

export const AdminUsersPage = () => {
    const [viewType, setViewType] = useState<ViewType>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'regular' | 'premium'>('all');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        premium: 0,
        newToday: 0,
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await adminService.getUsers();
            console.log('Users response:', response);
            setUsers(response.data || []);

            // Calculate stats
            const total = response.data?.length || 0;
            const premium = response.data?.filter((u: User) => u.userType === 'premium').length || 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const newToday = response.data?.filter((u: User) => new Date(u.createdAt) >= today).length || 0;

            setStats({ total, premium, newToday });
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (userId: string, userName: string) => {
        try {
            await adminService.updateUser(userId, { userType: 'premium' });
            toast.success(`${userName} upgraded to Premium!`);
            loadUsers();
        } catch (error) {
            console.error('Error upgrading user:', error);
            toast.error('Failed to upgrade user');
        }
    };

    const handleDowngrade = async (userId: string, userName: string) => {
        try {
            await adminService.updateUser(userId, { userType: 'regular' });
            toast.success(`${userName} downgraded to Regular`);
            loadUsers();
        } catch (error) {
            console.error('Error downgrading user:', error);
            toast.error('Failed to downgrade user');
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

        try {
            await adminService.deleteUser(userId);
            toast.success('User deleted successfully');
            loadUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterType === 'all') return matchesSearch;
        if (filterType === 'regular') return matchesSearch && user.userType === 'regular';
        if (filterType === 'premium') return matchesSearch && user.userType === 'premium';
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
                    <h1 className="text-4xl mb-2">User Management</h1>
                    <p className="text-gray-400">Manage user accounts and subscriptions</p>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10"
                >
                    <p className="text-sm text-gray-400 mb-1">Total Users</p>
                    <p className="text-3xl">{stats.total}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10"
                >
                    <p className="text-sm text-gray-400 mb-1">Premium Users</p>
                    <p className="text-3xl text-yellow-400">{stats.premium}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10"
                >
                    <p className="text-sm text-gray-400 mb-1">New Today</p>
                    <p className="text-3xl text-emerald-400">{stats.newToday}</p>
                </motion.div>
            </div>

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
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2">
                    {(['all', 'regular', 'premium'] as const).map((type) => (
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
                    <p className="text-gray-400 mt-4">Loading users...</p>
                </div>
            ) : (
                <>
                    {/* User List/Grid */}
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
                                            <th className="text-left px-4 py-3 text-sm text-gray-400">User</th>
                                            <th className="text-left px-4 py-3 text-sm text-gray-400">Email</th>
                                            <th className="text-left px-4 py-3 text-sm text-gray-400">Type</th>
                                            <th className="text-left px-4 py-3 text-sm text-gray-400">Joined</th>
                                            <th className="text-left px-4 py-3 text-sm text-gray-400">Stats</th>
                                            <th className="text-right px-4 py-3 text-sm text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user, index) => (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                                className="border-b border-white/10 last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.profilePicture}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <span className="font-medium">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {user.userType === 'premium' ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-400 text-xs rounded-full border border-yellow-400/30">
                                                                <Crown className="w-3 h-3" />
                                                                Premium
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-400/20 text-gray-400 text-xs rounded-full">
                                                                <UserIcon className="w-3 h-3" />
                                                                Regular
                                                            </span>
                                                        )}
                                                        {user.role === 'admin' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 text-purple-400 text-xs rounded-full border border-purple-400/30">
                                                                <Shield className="w-3 h-3" />
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">
                                                    {user.listeningStats.totalSongsPlayed} plays
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {user.userType === 'regular' ? (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleUpgrade(user._id, user.name)}
                                                                className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
                                                                title="Upgrade to Premium"
                                                            >
                                                                <ArrowUpCircle className="w-4 h-4" />
                                                            </motion.button>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDowngrade(user._id, user.name)}
                                                                className="p-2 text-gray-400 hover:bg-gray-400/10 rounded-lg transition-colors"
                                                                title="Downgrade to Regular"
                                                            >
                                                                <ArrowDownCircle className="w-4 h-4" />
                                                            </motion.button>
                                                        )}
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleDelete(user._id, user.name)}
                                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                            title="Delete User"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredUsers.map((user, index) => (
                                <motion.div
                                    key={user._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ y: -4 }}
                                    className="group backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-20 h-20 rounded-full object-cover mb-3"
                                        />
                                        <h4 className="font-medium text-sm mb-1">{user.name}</h4>
                                        <p className="text-xs text-gray-400 mb-3 truncate w-full">{user.email}</p>

                                        <div className="flex items-center gap-2 mb-3">
                                            {user.userType === 'premium' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-400 text-xs rounded-full border border-yellow-400/30">
                                                    <Crown className="w-3 h-3" />
                                                    Premium
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-400/20 text-gray-400 text-xs rounded-full">
                                                    <UserIcon className="w-3 h-3" />
                                                    Regular
                                                </span>
                                            )}
                                            {user.role === 'admin' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 text-purple-400 text-xs rounded-full border border-purple-400/30">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 mb-3">
                                            Joined {formatDate(user.createdAt)}
                                        </p>

                                        <div className="flex gap-2 w-full">
                                            {user.userType === 'regular' ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleUpgrade(user._id, user.name)}
                                                    className="flex-1 p-2 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-lg transition-colors text-yellow-400 text-xs"
                                                >
                                                    Upgrade
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleDowngrade(user._id, user.name)}
                                                    className="flex-1 p-2 bg-gray-400/20 hover:bg-gray-400/30 rounded-lg transition-colors text-gray-400 text-xs"
                                                >
                                                    Downgrade
                                                </motion.button>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDelete(user._id, user.name)}
                                                className="p-2 bg-red-400/20 hover:bg-red-400/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-400">No users found</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
