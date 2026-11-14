import { useEffect, useMemo, useState } from 'react';
import type { BracketSize, Objekt, TournamentState } from '../types/objekt';
import { useI18n } from '../i18n/I18nContext';
import { createTournament, INITIAL_TOURNAMENT, selectWinner, undoWinner } from '../lib/tournament';
import { finishTopFour, getTopFourCandidates } from '../lib/topFour';
import { renderWorldCupPoster } from '../lib/worldCupPoster';
import { ArrowIcon, TrophyIcon } from './Icons';
import { ObjektArtwork, objektLabel } from './ObjektArtwork';

type Props = {
  items: Objekt[];
  isDemo: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
};

type DisplaySize = 4 | 8 | 16 | 32 | 64 | 128;
const SIZES: readonly DisplaySize[] = [4, 8, 16, 32, 64, 128];
type PoolMode = 'all' | 'favorites';

type Copy = {
  heading: string; tagline: string; setup: string; random: string; size: string;
  entries: string; all: string; fav: string; start: string; insufficient: (size: number) => string;
  final: string; semi: string; back: string; stop: string; error: string;
  choose: string; third: string; thirdNote: string; firstPlace: string; secondPlace: string;
  thirdPlace: string; fourthPlace: string; finished: string; share: string; copy: string;
  saveImage: string; copied: string; copyFailed: string; shareFailed: string; saved: string;
  reset: string; replay: string; favorite: string; unfavorite: string; preview: string;
  editThird: string; progress: string; match: (n: number) => string; round: (n: number) => string;
  resultHeader: string; imageBlocked: string; imageSaving: string;
};
const COPIES: Record<'ko' | 'en' | 'ja', Copy> = {
  ko: {
    heading: '오브젝트 월드컵', tagline: '마음에 드는 오브젝트를 골라보세요', setup: '월드컵 설정',
    random: '선택한 카드로 대결합니다', size: '참가 규모', entries: '참가 카드', all: '전체', fav: '즐겨찾기',
    start: '시작하기', insufficient: (n) => `${n}강을 진행하려면 카드 ${n}개가 필요합니다`,
    final: '결승', semi: '4강', back: '되돌리기', stop: '종료', error: '대진표를 불러올 수 없습니다',
    choose: '선택하기', third: '3·4위 결정전', thirdNote: '4강에서 탈락한 두 카드 중 하나를 선택해 주세요',
    firstPlace: '1위', secondPlace: '2위', thirdPlace: '3위', fourthPlace: '4위', finished: '최종 순위',
    share: '결과 공유', copy: '순위 복사', saveImage: '결과 이미지 저장', copied: '순위를 복사했어요',
    copyFailed: '복사할 수 없습니다. 다시 시도해 주세요', shareFailed: '공유할 수 없습니다', saved: '결과 이미지를 저장했어요',
    reset: '설정으로', replay: '다시 하기', favorite: '즐겨찾기 추가', unfavorite: '즐겨찾기 해제',
    preview: '미리보기 카드로 진행 중입니다', editThird: '3·4위 다시 선택', progress: '진행도',
    match: (n) => `${n}번째 대결`, round: (n) => `${n}강`, resultHeader: '박시온 오브젝트 월드컵', imageBlocked: '외부 카드 이미지의 저장 권한이 없어 사진 포함 PNG를 만들 수 없어요. 위 결과 화면을 캡처해 공유해 주세요.', imageSaving: '카드 이미지를 불러오고 있어요…',
  },
  en: {
    heading: 'Objekt World Cup', tagline: 'Pick your favorite Objekt in each match', setup: 'Tournament setup',
    random: 'Play with a random set of cards', size: 'Bracket size', entries: 'Card pool', all: 'All', fav: 'Favorites',
    start: 'Start', insufficient: (n) => `You need at least ${n} cards for this bracket`,
    final: 'Final', semi: 'Semifinal', back: 'Undo', stop: 'Exit', error: 'Could not load the bracket',
    choose: 'Choose', third: 'Third-place playoff', thirdNote: 'Choose between the two semifinal losers',
    firstPlace: '1st', secondPlace: '2nd', thirdPlace: '3rd', fourthPlace: '4th', finished: 'Final ranking',
    share: 'Share results', copy: 'Copy ranking', saveImage: 'Save result image', copied: 'Ranking copied',
    copyFailed: 'Could not copy the ranking', shareFailed: 'Could not share the results', saved: 'Result image saved',
    reset: 'Setup', replay: 'Play again', favorite: 'Add favorite', unfavorite: 'Remove favorite',
    preview: 'Using preview cards', editThird: 'Change third place', progress: 'Progress',
    match: (n) => `Match ${n}`, round: (n) => `Round of ${n}`, resultHeader: 'ShiOn Objekt World Cup', imageBlocked: 'The image host blocks exporting photos. Please share a screenshot of the ranking above instead.', imageSaving: 'Preparing the photo poster…',
  },
  ja: {
    heading: 'Objektワールドカップ', tagline: '好きなObjektを選んでください', setup: '大会設定',
    random: 'ランダムに選んだカードで対戦します', size: '参加数', entries: 'カードの範囲', all: 'すべて', fav: 'お気に入り',
    start: 'スタート', insufficient: (n) => `${n}枚以上のカードが必要です`,
    final: '決勝', semi: '準決勝', back: '一つ戻す', stop: '終了', error: '対戦表を読み込めません',
    choose: '選ぶ', third: '3位決定戦', thirdNote: '準決勝で敗れた2枚から選んでください',
    firstPlace: '1位', secondPlace: '2位', thirdPlace: '3位', fourthPlace: '4位', finished: '最終順位',
    share: '結果を共有', copy: '順位をコピー', saveImage: '結果画像を保存', copied: '順位をコピーしました',
    copyFailed: 'コピーできませんでした', shareFailed: '共有できませんでした', saved: '結果画像を保存しました',
    reset: '設定', replay: 'もう一度', favorite: 'お気に入りに追加', unfavorite: 'お気に入りを解除',
    preview: 'プレビューカードを使用中', editThird: '3位決定戦をやり直す', progress: '進行状況',
    match: (n) => `第${n}対戦`, round: (n) => `${n}枚対戦`, resultHeader: 'シオンObjektワールドカップ', imageBlocked: '画像配信元の制限により写真入りPNGを保存できません。上の結果画面をスクリーンショットで共有してください。', imageSaving: '画像を準備しています…',
  },
};

function MatchCard({ item, label, choose, onSelect }: {
  item: Objekt; label: string; choose: string; onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} aria-label={`${label} ${item.season} ${objektLabel(item)} ${choose}`}
      className="group min-w-0 w-full rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush">
      <div className="relative transition-transform duration-[250ms] ease-plush motion-safe:group-hover:-translate-y-0.5 group-active:scale-[.99]">
        <ObjektArtwork item={item} eager />
        <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md border border-white/10 bg-black/75 p-2.5 sm:inset-x-3 sm:bottom-3 sm:p-3">
          <p className="text-[10px] font-medium text-blush">{label}</p>
          <p className="mt-0.5 break-words text-[13px] font-semibold text-white sm:text-base">{objektLabel(item)}</p>
          <p className="mt-0.5 truncate text-[10px] text-white/75 sm:text-xs">{item.season}</p>
        </div>
      </div>
      <span className="mt-3 block text-center text-xs text-ash transition-colors duration-[250ms] ease-plush group-hover:text-paper">{choose}</span>
    </button>
  );
}

export function TournamentArena({ items, isDemo, favorites, onToggleFavorite }: Props) {
  const { language, formatNumber } = useI18n();
  const copy = COPIES[language];
  const [size, setSize] = useState<DisplaySize>(16);
  const [poolMode, setPoolMode] = useState<PoolMode>('all');
  const [state, setState] = useState<TournamentState>(INITIAL_TOURNAMENT);
  const [thirdId, setThirdId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const pool = useMemo(() => poolMode === 'favorites' ? items.filter((item) => favorites.has(item.id)) : items, [items, favorites, poolMode]);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  useEffect(() => {
    if (state.status === 'idle') return;
    if (state.entries.some((id) => !byId.has(id)) || (state.champion && !byId.has(state.champion))) {
      setState(INITIAL_TOURNAMENT);
      setThirdId(null);
    }
  }, [state, byId]);

  const begin = () => {
    setNotice('');
    setThirdId(null);
    try {
      // Legacy BracketSize definitions stop at 32; the engine supports all powers of two.
      setState(createTournament(pool.map((item) => item.id), size as BracketSize));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : copy.insufficient(size));
    }
  };
  const goToSetup = () => { setState(INITIAL_TOURNAMENT); setThirdId(null); setNotice(''); };
  const undo = () => { setState((current) => undoWinner(current)); setThirdId(null); setNotice(''); };
  const first = byId.get(state.entries[state.matchIndex * 2] ?? '');
  const second = byId.get(state.entries[state.matchIndex * 2 + 1] ?? '');
  const candidates = useMemo(() => getTopFourCandidates(state), [state]);
  const ranked = useMemo(() => finishTopFour(candidates, thirdId), [candidates, thirdId]);
  const thirdCandidates = candidates?.thirdPlaceMatch.map((id) => byId.get(id)).filter((item): item is Objekt => Boolean(item)) ?? [];
  const ranking = ranked ? [ranked.first, ranked.second, ranked.third, ranked.fourth]
    .map((id) => byId.get(id)).filter((item): item is Objekt => Boolean(item)) : [];
  const rankLabels = [copy.firstPlace, copy.secondPlace, copy.thirdPlace, copy.fourthPlace];
  const totalMatches = state.size - 1;
  const completedMatches = state.history.length;
  const progress = state.status === 'idle' || totalMatches <= 0 ? 0 : Math.round(completedMatches / totalMatches * 100);

  const shareText = () => `${copy.resultHeader} · ${size}${language === 'en' ? ' cards' : language === 'ja' ? '枚' : '강'}\n`
    + ranking.map((item, index) => `${rankLabels[index]}  ${item.season} ${objektLabel(item)}`).join('\n')
    + '\nSHION ARCHIVE · @bbangshion';
  const copyResult = async () => {
    if (ranking.length !== 4) return;
    const text = `${shareText()}\n${new URL(import.meta.env.BASE_URL, window.location.origin).href}`;
    try {
      await navigator.clipboard.writeText(text);
      setNotice(copy.copied);
    } catch { setNotice(copy.copyFailed); }
  };
  const shareResult = async () => {
    if (ranking.length !== 4) return;
    const text = shareText();
    const url = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: copy.resultHeader, text, url });
      else await copyResult();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setNotice(copy.shareFailed);
    }
  };
  const saveImage = async () => {
    if (ranking.length !== 4 || saving) return;
    setSaving(true);
    setNotice(copy.imageSaving);
    try {
      const output = await renderWorldCupPoster(
        ranking.map((item) => ({ item })), size,
      );
      if (!output.blob || output.missingImages > 0) {
        setNotice(copy.imageBlocked);
        return;
      }
      const objectUrl = URL.createObjectURL(output.blob);
      const link = document.createElement('a');
      link.download = `SHION-Objekt-Top4-${size}.png`;
      link.href = objectUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Object URLs must stay alive until the browser has started the download.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setNotice(copy.saved);
    } catch { setNotice(copy.imageBlocked); }
    finally { setSaving(false); }
  };

  return (
    <section className="animate-appear" aria-labelledby="tournament-title">
      <div className={ranked && ranking.length === 4 ? "sr-only" : "mb-6 flex flex-wrap items-end justify-between gap-3"}>
        <div>
          <h2 id="tournament-title" className="text-[24px] font-semibold tracking-[-.045em] text-paper sm:text-[32px]">{copy.heading}</h2>
          <p className="mt-1 text-[13px] text-ash">{copy.tagline}</p>
        </div>
        <TrophyIcon width={22} height={22} className="text-blush" />
      </div>
      {state.status === 'idle' ? (
        <div className="max-w-[680px] rounded-xl border border-white/[.09] bg-surface p-5 sm:p-7">
          <h3 className="text-lg font-semibold text-paper">{copy.setup}</h3>
          <p className="mt-2 text-[13px] leading-6 text-ash">{copy.random}</p>
          <fieldset className="mt-7">
            <legend className="mb-3 text-xs font-medium text-ash">{copy.size}</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SIZES.map((number) => <button key={number} type="button" disabled={pool.length < number} onClick={() => setSize(number)}
                aria-pressed={size === number} className={`min-h-[44px] rounded-lg border text-sm font-medium transition-colors duration-[250ms] ease-plush focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush disabled:cursor-not-allowed disabled:opacity-30 ${size === number ? 'border-blush bg-blush text-[#1B1720]' : 'border-white/10 bg-white/[.035] text-paper hover:border-blush/40'}`}>
                {copy.round(number)}
              </button>)}
            </div>
          </fieldset>
          <fieldset className="mt-7">
            <legend className="mb-3 text-xs font-medium text-ash">{copy.entries}</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={poolMode === 'all'} onClick={() => setPoolMode('all')} className={`pill ${poolMode === 'all' ? 'pill-active' : ''}`}>
                {copy.all} {formatNumber(items.length)}</button>
              <button type="button" aria-pressed={poolMode === 'favorites'} onClick={() => setPoolMode('favorites')} className={`pill ${poolMode === 'favorites' ? 'pill-active' : ''}`}>
                {copy.fav} {formatNumber(favorites.size)}</button>
            </div>
          </fieldset>
          {pool.length < size && <p className="mt-5 text-xs leading-6 text-[#E8BEAE]" role="status">{copy.insufficient(size)}</p>}
          {notice && <p className="mt-4 text-xs leading-6 text-ash" role="status">{notice}</p>}
          <button type="button" disabled={pool.length < size} onClick={begin} className="btn-primary mt-8 w-full gap-3 disabled:cursor-not-allowed disabled:opacity-40">
            {copy.start} <ArrowIcon width={17} height={17} />
          </button>
        </div>
      ) : state.status === 'playing' ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-paper">
                {state.entries.length === 2 ? copy.final : state.entries.length === 4 ? copy.semi : copy.round(state.entries.length)}
                <span className="ml-2 font-normal text-ash">{copy.match(state.matchIndex + 1)}</span>
              </p>
              <p className="mt-1 text-xs tabular-nums text-ash">{completedMatches} / {totalMatches}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={undo} disabled={state.history.length === 0}>{copy.back}</button>
              <button type="button" className="btn-ghost" onClick={goToSetup}>{copy.stop}</button>
            </div>
          </div>
          <progress aria-label={copy.progress} value={progress} max={100} className="bracket-progress mb-7 block h-[3px] w-full appearance-none overflow-hidden rounded-full bg-white/10" />
          {first && second ? (
            <div className="mx-auto grid max-w-[780px] grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] sm:gap-4">
              <MatchCard key={first.id} item={first} label="A" choose={copy.choose} onSelect={() => setState((current) => selectWinner(current, first.id))} />
              <span className="text-center text-[11px] font-medium text-ash sm:text-base">VS</span>
              <MatchCard key={second.id} item={second} label="B" choose={copy.choose} onSelect={() => setState((current) => selectWinner(current, second.id))} />
            </div>
          ) : <div role="alert" className="empty-box">{copy.error}<button type="button" className="btn-ghost mt-3" onClick={goToSetup}>{copy.reset}</button></div>}
        </div>
      ) : !ranked && candidates ? (
        <div className="mx-auto max-w-[810px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h3 className="text-xl font-semibold text-paper sm:text-2xl">{copy.third}</h3>
              <p className="mt-2 text-sm text-ash">{copy.thirdNote}</p></div>
            <button type="button" className="btn-ghost" onClick={undo}>{copy.back}</button>
          </div>
          {thirdCandidates.length === 2 ? (
            <div className="grid grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] sm:gap-4">
              <MatchCard item={thirdCandidates[0]!} label="A" choose={copy.choose} onSelect={() => { setThirdId(thirdCandidates[0]!.id); setNotice(''); }} />
              <span className="text-center text-xs text-ash">VS</span>
              <MatchCard item={thirdCandidates[1]!} label="B" choose={copy.choose} onSelect={() => { setThirdId(thirdCandidates[1]!.id); setNotice(''); }} />
            </div>
          ) : <div className="empty-box">{copy.error}<button type="button" onClick={goToSetup} className="btn-ghost mt-3">{copy.reset}</button></div>}
          <p className="mt-6 text-center text-xs text-ash">{copy.firstPlace} · {copy.secondPlace} — {copy.final} / {copy.thirdPlace} · {copy.fourthPlace} — {copy.third}</p>
        </div>
      ) : ranked && ranking.length === 4 ? (
        <div className="shion-top-four mx-auto" aria-label={copy.finished}>
          <div className="shion-podium-header">
            <p className="shion-podium-eyebrow">OBJEKT WORLD CUP</p>
            <h3>ShiOn</h3>
            <p className="shion-podium-subtitle">{copy.round(size)} · TOP 4</p>
          </div>
          <div className="shion-podium-stage">
            <div className="shion-podium-champion">
              <div className="shion-podium-hero-image"><ObjektArtwork item={ranking[0]!} eager large /></div>
              <p className="shion-podium-winner-label">01 <span>WINNER</span></p>
              <h4 className="shion-podium-winner-title">{ranking[0]!.season} <span>·</span> {objektLabel(ranking[0]!).replace(/^#/, '')}</h4>
              <button type="button" className="shion-podium-favorite" onClick={() => onToggleFavorite(ranking[0]!.id)}>
                {favorites.has(ranking[0]!.id) ? copy.unfavorite : copy.favorite}
              </button>
            </div>
            <div className="shion-podium-runners" aria-label={`${copy.secondPlace} · ${copy.thirdPlace} · ${copy.fourthPlace}`}>
              {ranking.slice(1).map((item, index) => (
                <div key={item.id} className={`shion-podium-runner shion-podium-runner-${index + 2}`}>
                  <p className="shion-podium-rank">{String(index + 2).padStart(2, '0')}</p>
                  <div className="shion-podium-runner-image"><ObjektArtwork item={item} eager /></div>
                  <div className="shion-podium-runner-line" />
                  <p className="shion-podium-serial">{objektLabel(item).replace(/^#/, '')}</p>
                  <p className="shion-podium-runner-season">{item.season}</p>
                </div>
              ))}
            </div>
            <p className="shion-podium-credit">SHION ARCHIVE <span>·</span> @bbangshion</p>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => void shareResult()} className="btn-primary">{copy.share}</button>
            <button type="button" onClick={() => void copyResult()} className="btn-ghost">{copy.copy}</button>
            <button type="button" disabled={saving} onClick={() => void saveImage()} className="btn-ghost">{saving ? copy.imageSaving : copy.saveImage}</button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => { setThirdId(null); setNotice(''); }} className="btn-ghost">{copy.editThird}</button>
            <button type="button" onClick={begin} className="btn-ghost">{copy.replay}</button>
            <button type="button" onClick={goToSetup} className="btn-ghost">{copy.reset}</button>
          </div>
          {notice && <p className="mt-4 text-center text-sm leading-6 text-ash" role="status">{notice}</p>}
        </div>
      ) : <div role="alert" className="empty-box">{copy.error}<button type="button" className="btn-ghost mt-3" onClick={goToSetup}>{copy.reset}</button></div>}
      {isDemo && <p className="mt-9 text-xs text-ash">{copy.preview}</p>}
    </section>
  );
}
