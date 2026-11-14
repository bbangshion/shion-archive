import { useEffect, useMemo, useState } from 'react';
import type { BracketSize, Objekt, TournamentState } from '../types/objekt';
import { createTournament, INITIAL_TOURNAMENT, roundLabel, selectWinner, undoWinner } from '../lib/tournament';
import { ArrowIcon, TrophyIcon } from './Icons';
import { ObjektArtwork } from './ObjektArtwork';

type Props = { items: Objekt[]; isDemo: boolean; favorites: Set<string>; onToggleFavorite: (id: string) => void };
const SIZES: BracketSize[] = [4, 8, 16, 32];

type PoolMode = 'all' | 'favorites';

function MatchCard({ item, label, onSelect }: { item: Objekt; label: string; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="group relative w-full max-w-[280px] text-left outline-none focus-visible:rounded-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush sm:max-w-[328px]">
      <div className="relative transition-transform duration-[250ms] ease-plush group-hover:-translate-y-1 group-active:scale-[.985]">
        <ObjektArtwork item={item} eager />
        <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md border border-white/15 bg-black/65 p-2.5 backdrop-blur-md sm:inset-x-3 sm:bottom-3 sm:p-3">
          <div className="text-[10px] font-semibold tracking-[.14em] text-blush">{label}</div>
          <div className="mt-1 truncate text-sm font-medium text-white sm:text-base">{item.title}</div>
          <div className="mt-0.5 truncate text-[10px] text-white/65 sm:text-xs">{item.series}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-paper/75 transition-colors duration-[250ms] ease-plush group-hover:text-blush sm:text-xs">이 오브젝트 선택 <ArrowIcon width={14} height={14}/></div>
    </button>
  );
}

export function TournamentArena({ items, isDemo, favorites, onToggleFavorite }: Props) {
  const [size, setSize] = useState<BracketSize>(8);
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
    catch (error) { setNotification(error instanceof Error ? error.message : '토너먼트를 시작할 수 없습니다.'); }
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
    const message = `나의 SHION OBJEKT 월드컵 우승은 ${champion.title}! — SHION ARCHIVE`;
    try {
      if (navigator.share) await navigator.share({ title: 'SHION OBJEKT WORLD CUP', text: message });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(message); setNotification('우승 결과 문구를 복사했습니다.'); }
      else setNotification(message);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setNotification('공유할 수 없습니다. 기기의 공유 설정을 확인해 주세요.');
    }
  };

  return (
    <section className="animate-appear" aria-labelledby="worldcup-title">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line/70 pb-6">
        <div><p className="micro-label mb-3">INTERACTIVE / SHION EDITION</p><h2 id="worldcup-title" className="heading-lg">Objekt World Cup<span className="text-blush">.</span></h2><p className="mt-2 text-sm leading-6 text-ash">가장 마음에 드는 시온의 오브젝트, 마지막 한 장까지.</p></div>
        <div className="flex items-center gap-2 text-xs text-ash"><TrophyIcon width={18} height={18}/><span>HEAD TO HEAD / 1 : 1</span></div>
      </div>
      {state.status === 'idle' ? (
        <div className="grid gap-7 lg:grid-cols-[1.3fr_.7fr]">
          <div className="rounded-[16px] border border-white/[.08] bg-surface p-5 shadow-ambient sm:p-8">
            <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-blush/35 text-xs text-blush">01</span><h3 className="text-lg font-semibold tracking-[-.03em] text-paper">대진표 만들기</h3></div>
            <p className="mt-4 text-sm leading-7 text-ash">참가할 오브젝트를 무작위로 섞어 1:1 선택을 진행합니다. 선택 결과는 이 기기에서만 처리되며 서버로 전송되지 않습니다.</p>
            <div className="mt-8"><div className="micro-label mb-3">BRACKET SIZE</div><div className="grid grid-cols-4 gap-2">{SIZES.map((number) => <button key={number} type="button" disabled={pool.length < number} onClick={() => setSize(number)} aria-pressed={size === number} className={`rounded-lg border py-3 text-center text-sm font-medium transition-all duration-[250ms] ease-plush focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush disabled:cursor-not-allowed disabled:opacity-30 ${size === number ? 'border-blush bg-blush text-[#1B1720]' : 'border-white/10 bg-white/[.035] text-paper hover:border-blush/40'}`}>{number}강</button>)}</div></div>
            <div className="mt-7"><div className="micro-label mb-3">SELECTION POOL</div><div className="flex flex-wrap gap-2"><button type="button" aria-pressed={poolMode === 'all'} onClick={() => setPoolMode('all')} className={`pill ${poolMode === 'all' ? 'pill-active' : ''}`}>전체 오브젝트 {items.length}</button><button type="button" aria-pressed={poolMode === 'favorites'} onClick={() => setPoolMode('favorites')} className={`pill ${poolMode === 'favorites' ? 'pill-active' : ''}`}>즐겨찾기만 {favorites.size}</button></div></div>
            {pool.length < size && <p className="mt-5 text-xs leading-6 text-[#E8BEAE]" role="status">선택한 컬렉션에 오브젝트가 {size}개 이상 있어야 {size}강을 시작할 수 있습니다.</p>}
            {notification && <p role="status" className="mt-4 text-xs leading-6 text-ash">{notification}</p>}
            <button type="button" onClick={begin} disabled={pool.length < size} className="btn-primary mt-8 w-full justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-40">월드컵 시작하기 <ArrowIcon width={17} height={17}/></button>
          </div>
          <aside className="flex flex-col justify-between rounded-[16px] border border-white/[.08] bg-[#242129] p-7 sm:p-8">
            <div><p className="micro-label">HOW IT WORKS</p><div className="mt-8 text-[clamp(68px,11vw,116px)] font-light leading-none tracking-[-.085em] text-paper/80">1<span className="text-blush">:</span>1</div><p className="mt-7 text-sm leading-7 text-ash">두 장 중 한 장을 고르면 다음 대결로 진행됩니다. 마지막 선택이 최종 우승 오브젝트가 됩니다.</p></div>
            <div className="mt-10 border-t border-white/10 pt-5 text-[11px] leading-6 text-ash">선택 취소 가능 · 새 대진표 생성 가능<br/>로그인 및 외부 서비스 연결 불필요</div>
          </aside>
        </div>
      ) : state.status === 'playing' ? (
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><span className="micro-label">{roundLabel(state.entries.length)} <span className="mx-2 text-white/20">/</span> MATCH {String(state.matchIndex + 1).padStart(2,'0')}</span><p className="mt-2 text-sm text-ash">{played} / {total} 선택 완료</p></div><div className="flex gap-2"><button type="button" className="btn-ghost" onClick={() => setState((current) => undoWinner(current))} disabled={state.history.length === 0}>이전 선택</button><button type="button" className="btn-ghost" onClick={() => setState(INITIAL_TOURNAMENT)}>종료</button></div></div>
          <progress aria-label="월드컵 진행도" value={progress} max={100} className="bracket-progress mb-10 block h-[3px] w-full appearance-none overflow-hidden rounded-full bg-white/10" />
          {first && second ? (
            <div className="mx-auto grid max-w-[790px] grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)] sm:gap-5">
              <MatchCard key={first.id} item={first} label="OPTION A" onSelect={() => choose(first.id)} />
              <span className="text-center text-xs font-light italic tracking-[-.04em] text-blush/85 sm:text-2xl">VS</span>
              <MatchCard key={second.id} item={second} label="OPTION B" onSelect={() => choose(second.id)} />
            </div>
          ) : <div role="alert" className="empty-box">대진표를 불러올 수 없습니다. <button type="button" onClick={() => setState(INITIAL_TOURNAMENT)} className="underline">처음으로</button></div>}
          <p className="mt-10 text-center text-xs text-ash">마음에 드는 카드를 터치해 선택하세요.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-[590px] text-center">
          <div className="mb-4 flex justify-center text-blush"><TrophyIcon width={28} height={28}/></div><p className="micro-label">YOUR OBJECT OF THE DAY</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-paper">The Winner<span className="text-blush">.</span></h3>
          {champion && <div className="mx-auto mt-8 max-w-[310px]"><ObjektArtwork item={champion} eager large/><div className="mt-5 text-xl font-semibold text-paper">{champion.title}</div><div className="mt-1 text-sm text-ash">{champion.series} · {champion.season}</div><button type="button" className="btn-ghost mt-5" onClick={() => onToggleFavorite(champion.id)}>{favorites.has(champion.id) ? '♥ 즐겨찾기 해제' : '♡ 즐겨찾기에 추가'}</button></div>}
          <div className="mt-9 flex flex-wrap justify-center gap-3"><button className="btn-primary" type="button" onClick={begin}>다시 플레이 <ArrowIcon width={17} height={17}/></button><button className="btn-ghost" type="button" onClick={() => setState(INITIAL_TOURNAMENT)}>설정으로</button><button className="btn-ghost" type="button" onClick={() => void shareResult()}>결과 공유</button></div>
          {notification && <p role="status" className="mt-4 text-sm text-ash">{notification}</p>}
        </div>
      )}
      {isDemo && <p className="mt-10 border-t border-white/[.06] pt-4 text-xs text-ash">미리보기용 샘플 데이터로 진행 중입니다. 공식 Objekt 이미지·번호가 아닌 테스트 카드입니다.</p>}
    </section>
  );
}
