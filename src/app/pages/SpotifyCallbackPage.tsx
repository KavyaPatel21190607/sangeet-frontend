import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import { motion } from 'motion/react';

export const SpotifyCallbackPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { handleSpotifyCallback } = useSpotifyAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
            console.error('Spotify auth error:', error);
            navigate('/search');
            return;
        }

        if (code) {
            handleSpotifyCallback(code).then(() => {
                // Redirect to search page after successful authentication
                navigate('/search');
            });
        } else {
            navigate('/search');
        }
    }, [location, handleSpotifyCallback, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <motion.div
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h2 className="text-2xl mb-2">Connecting to Spotify...</h2>
                <p className="text-gray-400">Please wait while we authenticate your account</p>
            </motion.div>
        </div>
    );
};
