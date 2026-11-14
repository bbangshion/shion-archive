import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useFavorites } from '../hooks/useFavorites';

export type ArchiveScreen = 'collection' | 'worldcup';

type ArchiveContextValue = {
  screen: ArchiveScreen;
  setScreen: (screen: ArchiveScreen) => void;
  catalogState: ReturnType<typeof useCatalog>;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ArchiveScreen>('collection');
  const catalogState = useCatalog();
  const [favorites, toggleFavorite] = useFavorites();
  const value = useMemo<ArchiveContextValue>(
    () => ({ screen, setScreen, catalogState, favorites, toggleFavorite }),
    [screen, catalogState, favorites, toggleFavorite],
  );
  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive(): ArchiveContextValue {
  const context = useContext(ArchiveContext);
  if (!context) throw new Error('useArchive must be used inside ArchiveProvider');
  return context;
}
