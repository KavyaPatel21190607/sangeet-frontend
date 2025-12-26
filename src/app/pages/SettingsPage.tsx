import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { 
  Bell, 
  Globe, 
  Moon, 
  Volume2, 
  Wifi, 
  Download, 
  Shield, 
  Smartphone,
  Monitor,
  Music,
  Headphones,
  Database,
  Languages,
  Eye,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/userService';

export const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [crossfade, setCrossfade] = useState(false);
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  const [normalizeVolume, setNormalizeVolume] = useState(false);

  const [language, setLanguage] = useState('en');
  const [streamingQuality, setStreamingQuality] = useState('high');
  const [downloadQuality, setDownloadQuality] = useState('high');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await userService.getProfile();
      const settings = response.data.settings || {};
      setNotifications(settings.notifications ?? true);
      setLanguage(settings.language || 'en');
      setStreamingQuality(settings.streamingQuality || 'high');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      await userService.updateSettings({
        notifications,
        language,
        streamingQuality,
        downloadQuality
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleClearCache = () => {
    toast.success('Cache cleared successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl mb-2">Settings</h1>
        <p className="text-gray-400">Customize your SANGEET experience</p>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl">Account</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <p>Privacy Settings</p>
                <p className="text-sm text-gray-400">Manage your privacy preferences</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-400" />
              <div>
                <p>Activity</p>
                <p className="text-sm text-gray-400">View your listening history</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </div>
      </motion.div>

      {/* Playback Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl">Playback</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">Crossfade</p>
              <p className="text-sm text-gray-400">Seamless transitions between tracks</p>
            </div>
            <button
              onClick={() => setCrossfade(!crossfade)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                crossfade ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: crossfade ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">Gapless Playback</p>
              <p className="text-sm text-gray-400">No silence between tracks</p>
            </div>
            <button
              onClick={() => setGaplessPlayback(!gaplessPlayback)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                gaplessPlayback ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: gaplessPlayback ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">Normalize Volume</p>
              <p className="text-sm text-gray-400">Equal loudness for all tracks</p>
            </div>
            <button
              onClick={() => setNormalizeVolume(!normalizeVolume)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                normalizeVolume ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: normalizeVolume ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Audio Quality */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Headphones className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl">Audio Quality</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block mb-3">Streaming Quality</label>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'normal', 'high'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => setStreamingQuality(quality)}
                  className={`p-4 rounded-lg border transition-all ${
                    streamingQuality === quality
                      ? 'bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border-emerald-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <p className="capitalize mb-1">{quality}</p>
                  <p className="text-xs text-gray-400">
                    {quality === 'low' && '96 kbps'}
                    {quality === 'normal' && '160 kbps'}
                    {quality === 'high' && '320 kbps'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-3">Download Quality</label>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'normal', 'high'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => setDownloadQuality(quality)}
                  className={`p-4 rounded-lg border transition-all ${
                    downloadQuality === quality
                      ? 'bg-gradient-to-r from-purple-400/20 to-pink-400/20 border-purple-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <p className="capitalize mb-1">{quality}</p>
                  <p className="text-xs text-gray-400">
                    {quality === 'low' && '96 kbps'}
                    {quality === 'normal' && '160 kbps'}
                    {quality === 'high' && '320 kbps'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Download Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl">Downloads</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">Auto Download</p>
              <p className="text-sm text-gray-400">Download playlists automatically</p>
            </div>
            <button
              onClick={() => setAutoDownload(!autoDownload)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                autoDownload ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: autoDownload ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">Download over WiFi only</p>
              <p className="text-sm text-gray-400">Save mobile data</p>
            </div>
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                offlineMode ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: offlineMode ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Downloaded</span>
              <span className="text-sm">2.4 GB</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">127 songs downloaded</p>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">Push Notifications</p>
              <p className="text-sm text-gray-400">Get notified about new releases</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notifications ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: notifications ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Monitor className="w-6 h-6 text-pink-400" />
          <h2 className="text-2xl">Display</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block mb-3">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Storage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl">Storage</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p>Cache</p>
              <p className="text-sm text-gray-400">452 MB</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearCache}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all"
            >
              Clear Cache
            </motion.button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p>Downloads</p>
              <p className="text-sm text-gray-400">2.4 GB</p>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-end gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-xl shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 transition-all"
        >
          Save Changes
        </motion.button>
      </motion.div>
    </div>
  );
};
