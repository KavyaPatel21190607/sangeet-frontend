import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';

interface MobileMenuProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
  onLogout: () => void;
}

export const MobileMenu = ({ currentPage, onNavigate, isAdmin, onLogout }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-[70] lg:hidden"
            >
              <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                isAdmin={isAdmin}
                onLogout={onLogout}
              />
              
              {/* Close Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
