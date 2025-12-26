import { motion } from 'motion/react';
import { Users, Music, Mic, Play, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

interface ActivityItem {
  action: string;
  time: string;
  type: 'user' | 'track' | 'podcast' | 'playlist';
}

interface TopTrack {
  _id: string;
  title: string;
  artist: string;
  plays: number;
  likes: number;
}

export const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<any>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    let hasError = false;

    // Load stats
    try {
      console.log('Fetching stats...');
      const statsResponse = await adminService.getStats();
      console.log('Stats Response:', statsResponse);
      setStatsData(statsResponse.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
      hasError = true;
    }

    // Load activity
    try {
      console.log('Fetching activity...');
      const activityResponse = await adminService.getActivity();
      console.log('Activity Response:', activityResponse);

      // Format activity data
      const formattedActivity: ActivityItem[] = [];

      if (activityResponse.activity?.recentUsers) {
        activityResponse.activity.recentUsers.forEach((user: any) => {
          formattedActivity.push({
            action: `New user: ${user.name}`,
            time: formatTimeAgo(user.createdAt),
            type: 'user'
          });
        });
      }

      if (activityResponse.activity?.recentTracks) {
        activityResponse.activity.recentTracks.forEach((track: any) => {
          formattedActivity.push({
            action: `Track uploaded: "${track.title}"`,
            time: formatTimeAgo(track.createdAt),
            type: track.category === 'podcast' ? 'podcast' : 'track'
          });
        });
      }

      if (activityResponse.activity?.recentPlaylists) {
        activityResponse.activity.recentPlaylists.forEach((playlist: any) => {
          formattedActivity.push({
            action: `Playlist created: "${playlist.name}"`,
            time: formatTimeAgo(playlist.createdAt),
            type: 'playlist'
          });
        });
      }

      // Sort by time and take latest 5
      formattedActivity.sort((a, b) => {
        const timeA = a.time.includes('minute') ? 1 : a.time.includes('hour') ? 2 : 3;
        const timeB = b.time.includes('minute') ? 1 : b.time.includes('hour') ? 2 : 3;
        return timeA - timeB;
      });
      setActivity(formattedActivity.slice(0, 5));
    } catch (error) {
      console.error('Error loading activity:', error);
      hasError = true;
    }

    // Load top content
    try {
      console.log('Fetching top content...');
      const topContentResponse = await adminService.getTopContent();
      console.log('Top Content Response:', topContentResponse);
      setTopTracks(topContentResponse.topTracks || []);
    } catch (error) {
      console.error('Error loading top content:', error);
      hasError = true;
    }

    if (hasError) {
      toast.error('Failed to load some dashboard data');
    }

    setLoading(false);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const formatPlays = (plays: number): string => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
    return plays.toString();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Upload Track':
      case 'Add Podcast':
        navigate('/admin/upload');
        break;
      case 'View Reports':
        navigate('/admin/content');
        break;
      case 'Manage Users':
        navigate('/admin/users');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Users',
      value: (statsData?.totalUsers || 0).toLocaleString(),
      icon: Users,
      growth: statsData?.growthRate?.users || 0,
      color: 'from-emerald-400 to-cyan-400',
    },
    {
      label: 'Total Tracks',
      value: (statsData?.totalSongs || 0).toLocaleString(),
      icon: Music,
      growth: statsData?.growthRate?.tracks || 0,
      color: 'from-purple-400 to-pink-400',
    },
    {
      label: 'Total Podcasts',
      value: (statsData?.totalPodcasts || 0).toLocaleString(),
      icon: Mic,
      growth: statsData?.growthRate?.podcasts || 0,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      label: 'Total Streams',
      value: formatPlays(statsData?.totalStreams || 0),
      icon: Play,
      growth: statsData?.growthRate?.streams || 0,
      color: 'from-orange-400 to-red-400',
    },
  ];

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Monitor and manage your platform</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.growth >= 0;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{Math.abs(stat.growth)}%</span>
                  </div>
                </div>

                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {activity.length > 0 ? (
              activity.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${item.type === 'user' ? 'bg-emerald-400' :
                    item.type === 'track' ? 'bg-purple-400' :
                      item.type === 'podcast' ? 'bg-blue-400' :
                        'bg-cyan-400'
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>

        {/* Top Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-xl mb-6">Top Performing Content</h2>

          <div className="space-y-4">
            {topTracks.length > 0 ? (
              topTracks.slice(0, 5).map((track, index) => (
                <motion.div
                  key={track._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-gray-500 w-6">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{track.title}</p>
                    <p className="text-xs text-gray-400">{track.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatPlays(track.plays)}</p>
                    <p className="text-xs text-emerald-400">{track.likes} likes</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tracks yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Upload Track', icon: Music, color: 'from-emerald-400 to-cyan-400' },
            { label: 'Add Podcast', icon: Mic, color: 'from-purple-400 to-pink-400' },
            { label: 'View Reports', icon: TrendingUp, color: 'from-blue-400 to-cyan-400' },
            { label: 'Manage Users', icon: Users, color: 'from-orange-400 to-red-400' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                onClick={() => handleQuickAction(action.label)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">{action.label}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
