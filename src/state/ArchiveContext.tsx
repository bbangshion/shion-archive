import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useFavorites } from '../hooks/useFavorites';

export type ArchiveScreen = 'home' | 'profile' | 'photos' | 'film' | 'collection' | 'worldcup';

type ArchiveContextValue = {
  screen: ArchiveScreen;
  setScreen: (screen: ArchiveScreen) => void;
  catalogState: ReturnType<typeof useCatalog>;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

function getScreenFromAddress(): ArchiveScreen {
  if (typeof window === 'undefined') return 'home';
  const route = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (route === 'profile') return 'profile';
  if (route === 'photos' || route === 'photo') return 'photos';
  if (route === 'film' || route === 'videos' || route === 'video') return 'film';
  if (route === 'objekt' || route === 'collection') return 'collection';
  if (route === 'worldcup' || route === 'world-cup') return 'worldcup';
  return 'home';
}

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [screen, updateScreen] = useState<ArchiveScreen>(getScreenFromAddress);
  const catalogState = useCatalog();
  const [favorites, toggleFavorite] = useFavorites();

  useEffect(() => {
    const onNavigation = () => updateScreen(getScreenFromAddress());
    window.addEventListener('popstate', onNavigation);
    window.addEventListener('hashchange', onNavigation);
    return () => {
      window.removeEventListener('popstate', onNavigation);
      window.removeEventListener('hashchange', onNavigation);
    };
  }, []);

  const setScreen = useCallback((next: ArchiveScreen) => {
    const nextHash = next === 'home' ? '' : next === 'profile' ? '#profile' : next === 'photos' ? '#photos' : next === 'film' ? '#film' : next === 'collection' ? '#objekt' : '#worldcup';
    const nextAddress = `${window.location.pathname}${window.location.search}${nextHash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextAddress) {
      window.history.pushState({ screen: next }, '', nextAddress);
    }
    updateScreen(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const value = useMemo<ArchiveContextValue>(
    () => ({ screen, setScreen, catalogState, favorites, toggleFavorite }),
    [screen, setScreen, catalogState, favorites, toggleFavorite],
  );
  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive(): ArchiveContextValue {
  const context = useContext(ArchiveContext);
  if (!context) throw new Error('useArchive must be used inside ArchiveProvider');
  return context;
}
