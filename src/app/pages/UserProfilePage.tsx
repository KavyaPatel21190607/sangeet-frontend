import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Camera, Crown, Star, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

interface UserProfilePageProps {
  userType: 'premium' | 'regular';
}

export const UserProfilePage = ({ userType }: UserProfilePageProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const { isSpotifyAuthenticated, spotifyUser, logoutSpotify } = useSpotifyAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    console.log('Spotify Auth State:', {
      isSpotifyAuthenticated,
      spotifyUser,
      hasUser: !!spotifyUser
    });
  }, [isSpotifyAuthenticated, spotifyUser]);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      console.log('Profile response:', response);
      setName(response.user?.name || '');
      setEmail(response.user?.email || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateProfile({ name, email });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl">My Profile</h1>
          {userType === 'premium' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center gap-1.5 shadow-lg shadow-yellow-400/30"
            >
              <Crown className="w-4 h-4 text-black" />
              <span className="text-sm text-black">Premium</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Free</span>
            </motion.div>
          )}
        </div>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </motion.div>

      {/* Premium Upgrade Banner (for regular users) */}
      {userType === 'regular' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl">Upgrade to Premium</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Enjoy ad-free music, offline downloads, and high-quality audio
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>✓ Unlimited skips</li>
                <li>✓ Offline listening</li>
                <li>✓ High-quality audio (320kbps)</li>
                <li>✓ No ads</li>
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-xl shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all whitespace-nowrap"
            >
              Upgrade Now
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Profile Picture */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <h2 className="text-xl mb-6">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full ${userType === 'premium'
              ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
              : 'bg-gradient-to-br from-gray-400 to-gray-600'
              } flex items-center justify-center`}>
              <User className="w-16 h-16 text-white" />
            </div>
            {userType === 'premium' && (
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-black" />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="w-5 h-5 text-black" />
            </motion.button>
          </div>
          <div>
            <p className="mb-2">Upload a new profile picture</p>
            <p className="text-sm text-gray-400">JPG, PNG up to 5MB</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <h2 className="text-xl mb-6">Profile Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-gray-300">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-lg shadow-lg hover:shadow-emerald-400/50 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </motion.button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <h2 className="text-xl mb-6">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-gray-300">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                placeholder="Enter current password"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-2 text-gray-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg shadow-lg hover:shadow-purple-400/50 transition-all flex items-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Update Password
          </motion.button>
        </form>
      </motion.div>

      {/* Subscription Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <h2 className="text-xl mb-6">Subscription Details</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
            <span className="text-gray-400">Plan</span>
            <span className="flex items-center gap-2">
              {userType === 'premium' ? (
                <>
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Premium
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 text-gray-400" />
                  Free
                </>
              )}
            </span>
          </div>
          {userType === 'premium' && (
            <>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Next Billing</span>
                <span>Jan 24, 2026</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Amount</span>
                <span>$9.99/month</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Spotify Account (for Premium users) */}
      {userType === 'premium' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-xl mb-6">Spotify Account</h2>
          {isSpotifyAuthenticated ? (
            spotifyUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-emerald-400/10 border border-emerald-400/30 rounded-lg">
                  {spotifyUser.images && spotifyUser.images[0] ? (
                    <img
                      src={spotifyUser.images[0].url}
                      alt={spotifyUser.displayName}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <User className="w-8 h-8 text-emerald-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-lg">{spotifyUser.displayName}</p>
                    <p className="text-sm text-gray-400">{spotifyUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${spotifyUser.product === 'premium'
                          ? 'bg-emerald-400/20 text-emerald-400'
                          : 'bg-gray-400/20 text-gray-400'
                        }`}>
                        {spotifyUser.product === 'premium' ? 'Spotify Premium' : 'Spotify Free'}
                      </span>
                      {spotifyUser.country && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-400">
                          {spotifyUser.country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-400/10 border border-blue-400/30 rounded-lg">
                  <div className="text-blue-400 text-sm">
                    ℹ️
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-400 font-medium mb-1">Connected Account</p>
                    <p className="text-xs text-gray-400">
                      Your Spotify account is connected. You can play full tracks from Spotify directly in the app.
                      {spotifyUser.product !== 'premium' && ' Note: Spotify Premium required for full playback.'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    logoutSpotify();
                    toast.success('Disconnected from Spotify');
                  }}
                  className="w-full px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Disconnect Spotify Account
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-yellow-400" />
                  </div>
                  <p className="text-yellow-400 mb-2">Spotify Connected but Profile Not Loaded</p>
                  <p className="text-sm text-gray-400 mb-6">
                    You're logged into Spotify but we couldn't load your profile. Click below to try again.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      logoutSpotify();
                      toast.info('Please login to Spotify again');
                      setTimeout(() => {
                        window.location.href = '/search';
                      }, 1000);
                    }}
                    className="px-6 py-3 bg-emerald-400 text-black rounded-lg font-medium"
                  >
                    Re-login to Spotify
                  </motion.button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4">No Spotify account connected</p>
              <p className="text-sm text-gray-500 mb-6">
                Connect your Spotify account to access millions of songs and play full tracks.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.location.href = '/search';
                }}
                className="px-6 py-3 bg-emerald-400 text-black rounded-lg font-medium"
              >
                Go to Search to Login
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Listening Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <h2 className="text-xl mb-6">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Songs Played', value: '1,234' },
            { label: 'Hours Listened', value: '456' },
            { label: 'Playlists', value: '12' },
            { label: 'Favorites', value: '89' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="text-center p-4 bg-white/5 rounded-lg"
            >
              <p className="text-2xl mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
