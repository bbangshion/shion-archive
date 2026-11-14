import type { TournamentState } from '../types/objekt';

/** A conventional single-elimination final decides #1 and #2.
 * The two semifinal losers must play once more to decide #3 and #4.
 * We derive them from the engine's actual 4-player snapshot,
 * never from an arbitrary elimination order.
 */
export type TopFourCandidates = Readonly<{
  championId: string;
  runnerUpId: string;
  thirdPlaceMatch: readonly [string, string];
}>;

export type TopFourResult = Readonly<{
  first: string;
  second: string;
  third: string;
  fourth: string;
}>;

export function getTopFourCandidates(state: TournamentState): TopFourCandidates | null {
  if (state.status !== 'complete' || !state.champion || state.entries.length !== 2) return null;
  const finalists = state.entries;
  if (!finalists.includes(state.champion) || finalists[0] === finalists[1]) return null;
  const semifinal = state.history.find((match) => match.entries.length === 4)?.entries;
  if (!semifinal || semifinal.length !== 4 || new Set(semifinal).size !== 4) return null;
  const [a, b, c, d] = semifinal;
  const [finalistA, finalistB] = finalists;
  if (!a || !b || !c || !d || !finalistA || !finalistB) return null;
  if (![a, b].includes(finalistA) || ![c, d].includes(finalistB)) return null;
  const loserA = a === finalistA ? b : a;
  const loserB = c === finalistB ? d : c;
  return {
    championId: state.champion,
    runnerUpId: finalistA === state.champion ? finalistB : finalistA,
    thirdPlaceMatch: [loserA, loserB],
  };
}

export function finishTopFour(candidates: TopFourCandidates | null, chosenThird: string | null): TopFourResult | null {
  if (!candidates || !chosenThird || !candidates.thirdPlaceMatch.includes(chosenThird)) return null;
  const fourth = candidates.thirdPlaceMatch.find((id) => id !== chosenThird);
  if (!fourth) return null;
  const result = [candidates.championId, candidates.runnerUpId, chosenThird, fourth];
  if (new Set(result).size !== 4) return null;
  return { first: result[0]!, second: result[1]!, third: result[2]!, fourth: result[3]! };
}
