import { useEffect, useMemo, useState } from 'react';
import type { BracketSize, Objekt, TournamentState } from '../types/objekt';
import { createTournament, INITIAL_TOURNAMENT, selectWinner, undoWinner } from '../lib/tournament';
import { objektLabel } from '../lib/catalog';
import { ArrowIcon, TrophyIcon } from './Icons';
import { ObjektArtwork } from './ObjektArtwork';

type Props = { items: Objekt[]; isDemo: boolean; favorites: Set<string>; onToggleFavorite: (id: string) => void };
const SIZES: BracketSize[] = [4, 8, 16, 32, 64, 128];

type PoolMode = 'all' | 'favorites';

function MatchCard({ item, label, onSelect }: { item: Objekt; label: string; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-label={`${label} ${item.season} ${objektLabel(item)} 선택`} className="group w-full min-w-0 text-left focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush">
      <div className="relative transition-transform duration-[250ms] ease-plush motion-safe:group-hover:-translate-y-0.5 group-active:scale-[.99]">
        <ObjektArtwork item={item} eager />
        <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md border border-white/10 bg-black/75 p-2.5 sm:inset-x-3 sm:bottom-3 sm:p-3">
          <div className="text-[10px] font-medium text-blush">{label}</div>
          <div className="mt-0.5 break-words text-[13px] font-semibold text-white sm:text-base">{objektLabel(item)}</div>
          <div className="mt-0.5 truncate text-[10px] text-white/75 sm:text-xs">{item.season}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center text-[12px] font-medium text-ash transition-colors duration-[250ms] ease-plush group-hover:text-paper">선택하기</div>
    </button>
  );
}

export function TournamentArena({ items, isDemo, favorites, onToggleFavorite }: Props) {
  const [size, setSize] = useState<BracketSize>(16);
  const [poolMode, setPoolMode] = useState<PoolMode>('all');
  const [state, setState] = useState<TournamentState>(INITIAL_TOURNAMENT);
  const [notification, setNotification] = useState('');
  const pool = useMemo(() => poolMode === 'favorites' ? items.filter((item) => favorites.has(item.id)) : items, [items, favorites, poolMode]);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  useEffect(() => {
    if (state.status === 'idle') return;
    if (state.entries.some((id) => !byId.has(id)) || (state.champion && !byId.has(state.champion))) {
      setState(INITIAL_TOURNAMENT);
    }
  }, [state, byId]);

  const begin = () => {
    setNotification('');
    try { setState(createTournament(pool.map((item) => item.id), size)); }
    catch (error) { setNotification(error instanceof Error ? error.message : '월드컵을 시작할 수 없어요'); }
  };
  const choose = (id: string) => setState((current) => selectWinner(current, id));
  const first = byId.get(state.entries[state.matchIndex * 2] ?? '');
  const second = byId.get(state.entries[state.matchIndex * 2 + 1] ?? '');
  const champion = byId.get(state.champion ?? '');
  const played = state.history.length;
  const total = state.size - 1;
  const progress = state.status === 'idle' ? 0 : Math.round((played / total) * 100);

  const shareResult = async () => {
    if (!champion) return;
    const message = `박시온 Objekt 월드컵 ${state.size}강 우승: ${champion.season} ${objektLabel(champion)} | SHION ARCHIVE`;
    try {
      if (navigator.share) await navigator.share({ title: '박시온 오브젝트 월드컵', text: message });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(message); setNotification('결과를 복사했어요'); }
      else setNotification(message);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setNotification('공유할 수 없어요. 기기의 공유 설정을 확인해 주세요');
    }
  };

  return (
    <section className="animate-appear" aria-labelledby="worldcup-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="worldcup-title" className="text-[24px] font-semibold tracking-[-.045em] text-paper sm:text-[32px]">Objekt World Cup</h2><p className="mt-1 text-[13px] text-ash">두 장 중 더 마음에 드는 오브젝트 선택하기</p></div>
        <TrophyIcon width={22} height={22} className="text-blush" />
      </div>
      {state.status === 'idle' ? (
        <div className="max-w-[680px] rounded-xl border border-white/[.09] bg-surface p-5 sm:p-7">
          <h3 className="text-lg font-semibold text-paper">월드컵 설정</h3>
          <p className="mt-2 text-[13px] leading-6 text-ash">카드를 무작위로 골라 대결을 시작합니다</p>
          <fieldset className="mt-7"><legend className="mb-3 text-[12px] font-medium text-ash">대진 규모</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{SIZES.map((number) => <button key={number} type="button" disabled={pool.length < number} onClick={() => setSize(number)} aria-pressed={size === number} className={`min-h-[44px] rounded-lg border text-center text-sm font-medium transition-[background-color,border-color,color] duration-[250ms] ease-plush focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush disabled:cursor-not-allowed disabled:opacity-30 ${size === number ? 'border-blush bg-blush text-[#1B1720]' : 'border-white/10 bg-white/[.035] text-paper hover:border-blush/40'}`}>{number}강</button>)}</div></fieldset>
          <fieldset className="mt-7"><legend className="mb-3 text-[12px] font-medium text-ash">참가 카드</legend><div className="flex flex-wrap gap-2"><button type="button" aria-pressed={poolMode === 'all'} onClick={() => setPoolMode('all')} className={`pill ${poolMode === 'all' ? 'pill-active' : ''}`}>전체 {items.length}</button><button type="button" aria-pressed={poolMode === 'favorites'} onClick={() => setPoolMode('favorites')} className={`pill ${poolMode === 'favorites' ? 'pill-active' : ''}`}>즐겨찾기 {favorites.size}</button></div></fieldset>
          {pool.length < size && <p className="mt-5 text-xs leading-6 text-[#E8BEAE]" role="status">{size}강에는 카드 {size}개 이상이 필요해요</p>}
          {notification && <p role="status" className="mt-4 text-xs leading-6 text-ash">{notification}</p>}
          <button type="button" onClick={begin} disabled={pool.length < size} className="btn-primary mt-8 w-full justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-40">시작하기 <ArrowIcon width={17} height={17}/></button>
          <p className="mt-4 text-center text-[11px] text-ash">선택 기록은 서버로 전송되지 않습니다</p>
        </div>
      ) : state.status === 'playing' ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-paper">{state.entries.length === 2 ? '결승' : `${state.entries.length}강`} <span className="font-normal text-ash">{state.matchIndex + 1}번째 대결</span></p><p className="mt-1 text-xs tabular-nums text-ash">{played} / {total} 선택</p></div><div className="flex gap-2"><button type="button" className="btn-ghost" onClick={() => setState((current) => undoWinner(current))} disabled={state.history.length === 0}>되돌리기</button><button type="button" className="btn-ghost" onClick={() => setState(INITIAL_TOURNAMENT)}>종료</button></div></div>
          <progress aria-label="월드컵 진행도" value={progress} max={100} className="bracket-progress mb-7 block h-[3px] w-full appearance-none overflow-hidden rounded-full bg-white/10" />
          {first && second ? (
            <div className="mx-auto grid max-w-[780px] grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] sm:gap-4">
              <MatchCard key={first.id} item={first} label="A" onSelect={() => choose(first.id)} />
              <span className="text-center text-[11px] font-medium text-ash sm:text-base">VS</span>
              <MatchCard key={second.id} item={second} label="B" onSelect={() => choose(second.id)} />
            </div>
          ) : <div role="alert" className="empty-box">대진표 오류 <button type="button" onClick={() => setState(INITIAL_TOURNAMENT)} className="mt-3 underline">처음으로</button></div>}
        </div>
      ) : (
        <div className="mx-auto max-w-[520px] text-center">
          <div className="mb-3 flex justify-center text-blush"><TrophyIcon width={27} height={27}/></div><h3 className="text-[27px] font-semibold tracking-[-.04em] text-paper">최종 우승</h3>
          {champion && <div className="mx-auto mt-6 max-w-[300px]"><ObjektArtwork item={champion} eager large/><div className="mt-4 text-xl font-semibold text-paper">{objektLabel(champion)}</div><div className="mt-1 text-sm text-ash">{champion.season}</div><button type="button" className="btn-ghost mt-4" onClick={() => onToggleFavorite(champion.id)}>{favorites.has(champion.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}</button></div>}
          <div className="mt-7 flex flex-wrap justify-center gap-2"><button className="btn-primary gap-2" type="button" onClick={begin}>다시 하기 <ArrowIcon width={16} height={16}/></button><button className="btn-ghost" type="button" onClick={() => setState(INITIAL_TOURNAMENT)}>설정</button><button className="btn-ghost" type="button" onClick={() => void shareResult()}>결과 공유</button></div>
          {notification && <p role="status" className="mt-4 text-sm text-ash">{notification}</p>}
        </div>
      )}
      {isDemo && <p className="mt-9 text-xs text-ash">미리보기 카드로 진행 중입니다</p>}
    </section>
  );
}
