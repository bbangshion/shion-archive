import { Collection } from './components/Collection';
import { TournamentArena } from './components/TournamentArena';
import { ArrowIcon, GridIcon, TrophyIcon } from './components/Icons';
import { ArchiveProvider, useArchive } from './state/ArchiveContext';

function LoadingView() {
  return <div role="status" aria-label="오브젝트 불러오는 중" className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <div key={i}><div className="aspect-[3/4] animate-pulse rounded-lg bg-raised"/><div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-raised"/></div>)}</div>;
}

function ArchiveApp() {
  const { screen, setScreen, catalogState: state, favorites, toggleFavorite } = useArchive();
  const catalog = state.status === 'ready' ? state.catalog : null;
  const items = catalog?.items ?? [];
  return (
    <div className="min-h-dvh bg-canvas text-paper">
      <header className="border-b border-white/[.08] bg-canvas">
        <div className="mx-auto flex h-[66px] max-w-[1300px] items-center justify-between gap-4 px-4 sm:px-8">
          <a href={import.meta.env.BASE_URL} className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush" aria-label="SHION ARCHIVE 홈">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 text-[19px] font-light text-paper" aria-hidden="true">S</span>
            <span className="min-w-0"><span className="block truncate text-[13px] font-semibold tracking-[.15em] text-paper sm:text-sm">SHION ARCHIVE</span><span className="mt-0.5 block text-[10px] text-ash">tripleS S20 · 박시온</span></span>
          </a>
          <span className="hidden text-[11px] text-ash sm:inline">CREATED BY @bbangshion</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1300px] px-4 pb-16 sm:px-8 sm:pb-24">
        <section className="flex flex-col justify-between gap-6 border-b border-white/[.09] py-9 sm:flex-row sm:items-end sm:py-12">
          <div className="max-w-[730px]">
            <p className="mb-3 text-[11px] font-medium tracking-[.11em] text-blush">S20 PARK SHION</p>
            <h1 className="text-[clamp(33px,5vw,62px)] font-semibold leading-[1.11] tracking-[-.065em] text-paper">박시온 오브젝트</h1>
            <p className="mt-3 text-[13px] leading-6 text-ash sm:text-sm">컬렉션을 살펴보고, 마음에 드는 카드를 골라보세요</p>
          </div>
          <div className="flex shrink-0 gap-7 sm:gap-10">
            <div><div className="text-[11px] text-ash">전체 카드</div><div className="mt-1 text-[27px] font-medium tabular-nums tracking-[-.055em] text-paper">{state.status === 'ready' ? items.length.toLocaleString('ko-KR') : '—'}</div></div>
            <div><div className="text-[11px] text-ash">즐겨찾기</div><div className="mt-1 text-[27px] font-medium tabular-nums tracking-[-.055em] text-paper">{favorites.size}</div></div>
          </div>
        </section>

        <div className="archive-tab-bar sticky top-0 z-30 -mx-4 mb-7 border-b border-white/[.1] px-4 sm:-mx-8 sm:px-8">
          <nav aria-label="아카이브 메뉴" className="flex h-[55px] items-center gap-7 sm:gap-10">
            <button type="button" onClick={() => setScreen('collection')} aria-current={screen === 'collection' ? 'page' : undefined} className={`nav-item ${screen === 'collection' ? 'nav-current' : ''}`}><GridIcon width={17} height={17}/> COLLECTION</button>
            <button type="button" onClick={() => setScreen('worldcup')} aria-current={screen === 'worldcup' ? 'page' : undefined} className={`nav-item ${screen === 'worldcup' ? 'nav-current' : ''}`}><TrophyIcon width={17} height={17}/> WORLD CUP</button>
          </nav>
        </div>

        {state.status === 'loading' ? <LoadingView/> : state.status === 'error' ? (
          <div role="alert" className="empty-box"><p className="text-lg font-medium text-paper">오브젝트를 불러오지 못했어요</p><p className="mt-3 max-w-xl break-words text-sm leading-7 text-ash">{state.error}</p><button type="button" className="btn-primary mt-6 gap-2" onClick={state.retry}>다시 시도 <ArrowIcon width={16} height={16}/></button></div>
        ) : items.length === 0 ? (
          <div className="empty-box"><p className="text-lg font-medium text-paper">표시할 카드가 없어요</p><p className="mt-3 max-w-xl text-sm leading-7 text-ash">연결된 데이터에서 박시온(S20) 카드를 찾지 못했습니다</p><button type="button" className="btn-ghost mt-6" onClick={state.retry}>다시 확인</button></div>
        ) : (
          <>
            {catalog?.isDemo && <div role="note" className="mb-6 rounded-lg border border-white/10 bg-surface px-4 py-3 text-xs text-ash">미리보기 데이터입니다 · 실제 카드 데이터가 연결되면 자동으로 바뀝니다</div>}
            {screen === 'collection' ? <Collection items={items} favorites={favorites} onToggleFavorite={toggleFavorite}/> : <TournamentArena items={items} isDemo={!!catalog?.isDemo} favorites={favorites} onToggleFavorite={toggleFavorite}/>}
          </>
        )}
      </main>
      <footer className="border-t border-white/[.08] px-4 py-7 sm:px-8"><div className="mx-auto flex max-w-[1236px] flex-wrap items-center justify-between gap-3 text-[11px] text-ash"><span className="font-semibold tracking-[.1em] text-paper">SHION ARCHIVE</span><span>비공식 팬 아카이브 · CREATED BY <span className="text-paper">@bbangshion</span></span></div></footer>
    </div>
  );
}

export default function App() {
  return <ArchiveProvider><ArchiveApp /></ArchiveProvider>;
}
