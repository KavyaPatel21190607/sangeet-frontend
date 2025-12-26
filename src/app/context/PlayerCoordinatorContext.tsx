import { createContext, useContext, useState, ReactNode } from 'react';

type ActivePlayer = 'admin' | 'spotify' | null;

interface PlayerCoordinatorContextType {
    activePlayer: ActivePlayer;
    setActivePlayer: (player: ActivePlayer) => void;
    pauseAdminPlayer: () => void;
    pauseSpotifyPlayer: () => void;
    registerAdminPause: (pauseFn: () => void) => void;
    registerSpotifyPause: (pauseFn: () => void) => void;
}

const PlayerCoordinatorContext = createContext<PlayerCoordinatorContextType | undefined>(undefined);

export const usePlayerCoordinator = () => {
    const context = useContext(PlayerCoordinatorContext);
    if (!context) {
        throw new Error('usePlayerCoordinator must be used within PlayerCoordinatorProvider');
    }
    return context;
};

export const PlayerCoordinatorProvider = ({ children }: { children: ReactNode }) => {
    const [activePlayer, setActivePlayer] = useState<ActivePlayer>(null);
    const [adminPauseFn, setAdminPauseFn] = useState<(() => void) | null>(null);
    const [spotifyPauseFn, setSpotifyPauseFn] = useState<(() => void) | null>(null);

    const registerAdminPause = (pauseFn: () => void) => {
        setAdminPauseFn(() => pauseFn);
    };

    const registerSpotifyPause = (pauseFn: () => void) => {
        setSpotifyPauseFn(() => pauseFn);
    };

    const pauseAdminPlayer = () => {
        if (adminPauseFn) {
            adminPauseFn();
        }
    };

    const pauseSpotifyPlayer = () => {
        if (spotifyPauseFn) {
            spotifyPauseFn();
        }
    };

    return (
        <PlayerCoordinatorContext.Provider
            value={{
                activePlayer,
                setActivePlayer,
                pauseAdminPlayer,
                pauseSpotifyPlayer,
                registerAdminPause,
                registerSpotifyPause,
            }}
        >
            {children}
        </PlayerCoordinatorContext.Provider>
    );
};
