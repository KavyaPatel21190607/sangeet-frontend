import { motion } from 'motion/react';
import { Home, Search, Heart, ListMusic, User, LogOut, Settings, Upload, Users } from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
  onLogout: () => void;
}

export const Sidebar = ({ currentPage, onNavigate, isAdmin, onLogout }: SidebarProps) => {
  const userLinks = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'liked', icon: Heart, label: 'Liked' },
    { id: 'playlists', icon: ListMusic, label: 'Playlists' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { id: 'admin-overview', icon: Home, label: 'Overview' },
    { id: 'admin-upload', icon: Upload, label: 'Upload' },
    { id: 'admin-content', icon: ListMusic, label: 'Content' },
    { id: 'admin-users', icon: Users, label: 'Users' },
    { id: 'admin-profile', icon: User, label: 'Profile' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen backdrop-blur-3xl bg-black/40 border-r border-white/10 flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate(isAdmin ? 'admin-overview' : 'home')}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl"
          >
            🎧
          </motion.div>
          <div>
            <h1 className="text-2xl tracking-tight">SANGEET</h1>
            <p className="text-xs text-gray-400">{isAdmin ? 'Admin' : 'Feel the Sound'}</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPage === link.id;

          return (
            <motion.button
              key={link.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(link.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border border-emerald-400/30 text-white shadow-lg shadow-emerald-400/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-emerald-400")} />
              <span>{link.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 pb-28 border-t border-white/10 space-y-2">
        {!isAdmin && (
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};
