import type { BracketSize, TournamentSnapshot, TournamentState } from '../types/objekt';

export const INITIAL_TOURNAMENT: TournamentState = {
  status: 'idle', size: 8, entries: [], next: [], matchIndex: 0, champion: null, history: [],
};

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    // unbiased integer selection with rejection sampling when Web Crypto is available
    let j = Math.floor(Math.random() * (i + 1));
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const range = i + 1;
      const limit = Math.floor(0x100000000 / range) * range;
      const sample = new Uint32Array(1);
      do { crypto.getRandomValues(sample); } while ((sample[0] ?? 0) >= limit);
      j = (sample[0] ?? 0) % range;
    }
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function createTournament(ids: string[], size: BracketSize): TournamentState {
  const unique = [...new Set(ids)];
  if (unique.length < size) throw new Error(`${size}강을 시작하려면 서로 다른 오브젝트 ${size}개가 필요합니다.`);
  return {
    status: 'playing', size, entries: shuffle(unique).slice(0, size),
    next: [], matchIndex: 0, champion: null, history: [],
  };
}

export function selectWinner(state: TournamentState, chosenId: string): TournamentState {
  if (state.status !== 'playing') return state;
  const left = state.entries[state.matchIndex * 2];
  const right = state.entries[state.matchIndex * 2 + 1];
  if (!left || !right || (chosenId !== left && chosenId !== right)) return state;

  const snapshot: TournamentSnapshot = {
    entries: [...state.entries], next: [...state.next],
    matchIndex: state.matchIndex, champion: state.champion,
  };
  const history = [...state.history, snapshot];
  const next = [...state.next, chosenId];
  if (state.matchIndex + 1 < state.entries.length / 2) {
    return { ...state, next, matchIndex: state.matchIndex + 1, history };
  }
  if (next.length === 1) {
    return {
      ...state, status: 'complete', champion: next[0] ?? null,
      next, matchIndex: 0, history,
    };
  }
  return { ...state, entries: next, next: [], matchIndex: 0, history };
}

export function undoWinner(state: TournamentState): TournamentState {
  if (state.history.length === 0) return state;
  const snapshot = state.history[state.history.length - 1];
  if (!snapshot) return state;
  return {
    ...state,
    ...snapshot,
    status: 'playing',
    history: state.history.slice(0, -1),
  };
}

export function roundLabel(entryCount: number): string {
  if (entryCount === 2) return 'FINAL';
  return `ROUND OF ${entryCount}`;
}
