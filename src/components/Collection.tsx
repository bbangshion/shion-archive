import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { CollectionMode, Objekt, SortMode } from '../types/objekt';
import { filterObjekts } from '../lib/catalog';
import { ArrowIcon, HeartIcon, SearchIcon } from './Icons';
import { ObjektCard } from './ObjektCard';
import { DetailDialog } from './DetailDialog';

type Props = { items: Objekt[]; favorites: Set<string>; onToggleFavorite: (id: string) => void };
const PAGE_SIZE = 36;

export function Collection({ items, favorites, onToggleFavorite }: Props) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [series, setSeries] = useState('all');
  const [season, setSeason] = useState('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [mode, setMode] = useState<CollectionMode>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Objekt | null>(null);
  const closeDetail = useCallback(() => setSelected(null), []);

  const seriesOptions = useMemo(() => [...new Set(items.map((item) => item.series))].sort(), [items]);
  const seasonOptions = useMemo(() => [...new Set(items.map((item) => item.season))].sort().reverse(), [items]);
  const results = useMemo(() => filterObjekts(items, { query: deferredQuery, series, season, sort, mode, favoriteIds: favorites }), [items, deferredQuery, series, season, sort, mode, favorites]);
  const visible = results.slice(0, visibleCount);

  useEffect(() => setVisibleCount(PAGE_SIZE), [deferredQuery, series, season, sort, mode]);
  const clear = () => { setQuery(''); setSeries('all'); setSeason('all'); setSort('newest'); setMode('all'); };

  return (
    <section className="animate-appear" aria-labelledby="collection-title">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line/70 pb-6"><div><p className="micro-label mb-3">INDEX / S20 COLLECTIBLES</p><h2 id="collection-title" className="heading-lg">The Collection<span className="text-blush">.</span></h2><p className="mt-2 text-sm leading-6 text-ash">한 장씩 찾아보고, 마음에 드는 시온을 모아보세요.</p></div><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ash">{items.length.toLocaleString('ko-KR')} ARCHIVED</span></div>
      <div className="rounded-[14px] border border-white/[.08] bg-surface px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,.8fr)_minmax(0,.7fr)_minmax(0,.7fr)]">
          <label className="relative block"><span className="sr-only">오브젝트 검색</span><SearchIcon className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-ash"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름, ID, 시리즈 검색" maxLength={140} className="field w-full pl-11" type="search" /></label>
          <label className="block"><span className="sr-only">시리즈 필터</span><select className="field w-full" value={series} onChange={(event) => setSeries(event.target.value)}><option value="all">모든 시리즈</option>{seriesOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="block"><span className="sr-only">시즌 필터</span><select className="field w-full" value={season} onChange={(event) => setSeason(event.target.value)}><option value="all">모든 시즌</option>{seasonOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="block"><span className="sr-only">정렬 순서</span><select className="field w-full" value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="newest">최신순</option><option value="oldest">오래된순</option><option value="title">이름순</option></select></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><button type="button" onClick={() => setMode('all')} aria-pressed={mode === 'all'} className={`pill ${mode === 'all' ? 'pill-active' : ''}`}>전체</button><button type="button" onClick={() => setMode('favorites')} aria-pressed={mode === 'favorites'} className={`pill gap-1.5 ${mode === 'favorites' ? 'pill-active' : ''}`}><HeartIcon width={14} height={14}/> 즐겨찾기 {favorites.size}</button></div><button type="button" onClick={clear} className="text-xs text-ash underline-offset-4 transition-colors duration-[250ms] ease-plush hover:text-paper hover:underline">필터 초기화</button></div>
      </div>
      <div className="mb-5 mt-7 flex justify-between gap-3 text-xs text-ash"><span aria-live="polite">{results.length.toLocaleString('ko-KR')}개 결과</span><span>{Math.min(visible.length, results.length)}개 표시 중</span></div>
      {results.length ? (
        <><div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 xl:grid-cols-5">{visible.map((item) => <ObjektCard key={item.id} item={item} isFavorite={favorites.has(item.id)} onToggleFavorite={onToggleFavorite} onOpen={setSelected}/>)}</div>
          {visible.length < results.length && <div className="mt-11 flex justify-center"><button type="button" className="btn-ghost gap-3" onClick={() => setVisibleCount((previous) => previous + PAGE_SIZE)}>더 보기 <ArrowIcon width={16} height={16}/></button></div>}
        </>
      ) : <div className="empty-box"><p className="text-base text-paper">검색 결과가 없습니다.</p><p className="mt-2 text-sm text-ash">검색어나 필터를 변경해 주세요.</p><button type="button" className="btn-ghost mt-5" onClick={clear}>모든 오브젝트 보기</button></div>}
      <DetailDialog item={selected} onClose={closeDetail} isFavorite={!!selected && favorites.has(selected.id)} onToggleFavorite={onToggleFavorite}/>
    </section>
  );
}
