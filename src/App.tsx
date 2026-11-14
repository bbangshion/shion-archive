import { Collection } from './components/Collection';
import { TournamentArena } from './components/TournamentArena';
import { ArrowIcon, GridIcon, TrophyIcon } from './components/Icons';
import { ArchiveProvider, useArchive } from './state/ArchiveContext';

function LoadingView() {
  return <div role="status" aria-label="오브젝트 불러오는 중" className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <div key={i}><div className="aspect-[3/4] animate-pulse rounded-[9px] bg-raised"/><div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-raised"/></div>)}</div>;
}

function ArchiveApp() {
  const { screen, setScreen, catalogState: state, favorites, toggleFavorite } = useArchive();
  const catalog = state.status === 'ready' ? state.catalog : null;
  const items = catalog?.items ?? [];

  return (
    <div className="min-h-dvh bg-canvas text-paper">
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[560px] overflow-hidden" aria-hidden="true"><div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_40%_at_90%_5%,rgba(126,107,137,.12),transparent_90%)]" /></div>
      <header className="relative z-10 border-b border-white/[.07] bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1480px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href={import.meta.env.BASE_URL} className="flex min-w-0 items-center gap-3 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush" aria-label="SHION ARCHIVE 첫 화면">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-blush/50 text-xl font-light leading-none text-blush">S<span className="-ml-0.5 self-end pb-2 text-[10px]">.</span></div>
            <div className="min-w-0"><div className="truncate text-[13px] font-semibold tracking-[.17em] text-paper sm:text-[14px]">SHION ARCHIVE</div><div className="mt-0.5 text-[9px] font-semibold tracking-[.23em] text-ash">TRIPLES S20 / PARK SHION</div></div>
          </a>
          <div className="hidden items-center gap-2 text-[10px] tracking-[.15em] text-ash sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-blush"/> INDEPENDENT FAN ARCHIVE <span className="ml-4 text-white/30">EST. 2026</span></div>
        </div>
      </header>
      <main className="relative mx-auto max-w-[1480px] px-5 pb-24 sm:px-8 lg:px-12">
        <section className="relative flex flex-col justify-between gap-10 border-b border-white/[.09] py-12 sm:py-16 lg:flex-row lg:items-end lg:py-20">
          <div><p className="micro-label mb-5">A PERSONAL RECORD OF S20 <span className="mx-2 text-white/20">/</span> 01 — OBJEKT SYSTEM</p><h1 className="max-w-[900px] text-[clamp(49px,8vw,118px)] font-medium leading-[.91] tracking-[-.085em] text-paper">SHION<span className="text-blush">.</span><br/><span className="font-light text-paper/75">THE ARCHIVE</span></h1><p className="mt-6 max-w-[570px] text-sm leading-7 text-ash sm:text-base">박시온을 기록하는 또 하나의 방식.<br className="hidden sm:block"/> 단순한 이미지 모음이 아닌, 찾아보고 비교하고 직접 선택하는 인터랙티브 아카이브.</p></div>
          <div className="flex shrink-0 gap-7 border-t border-white/10 pt-5 sm:gap-10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><div><div className="text-[10px] tracking-[.15em] text-ash">S20 OBJEKT</div><div className="mt-2 text-3xl font-light tracking-[-.05em] text-paper">{state.status === 'ready' ? items.length.toLocaleString('ko-KR') : '—'}</div></div><div><div className="text-[10px] tracking-[.15em] text-ash">FAVORITES</div><div className="mt-2 text-3xl font-light tracking-[-.05em] text-paper">{favorites.size}</div></div></div>
        </section>
        <div className="sticky top-0 z-20 -mx-5 mb-10 border-b border-white/[.08] bg-canvas/95 px-5 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <nav aria-label="SHION OBJEKT 메뉴" className="flex max-w-full items-center gap-6 overflow-x-auto sm:gap-10">
            <button type="button" onClick={() => setScreen('collection')} aria-current={screen === 'collection' ? 'page' : undefined} className={`nav-item ${screen === 'collection' ? 'nav-current' : ''}`}><GridIcon width={16} height={16}/> COLLECTION <span className="hidden text-[10px] opacity-50 sm:inline">01</span></button>
            <button type="button" onClick={() => setScreen('worldcup')} aria-current={screen === 'worldcup' ? 'page' : undefined} className={`nav-item ${screen === 'worldcup' ? 'nav-current' : ''}`}><TrophyIcon width={16} height={16}/> WORLD CUP <span className="hidden text-[10px] opacity-50 sm:inline">02</span></button>
            <span className="ml-auto hidden whitespace-nowrap text-[10px] font-medium tracking-[.2em] text-ash/55 lg:block">EXPLORE / SELECT / REMEMBER</span>
          </nav>
        </div>
        {state.status === 'loading' ? <LoadingView/> : state.status === 'error' ? (
          <div role="alert" className="empty-box"><p className="text-lg font-medium text-paper">오브젝트 데이터 연결 실패</p><p className="mt-3 max-w-xl break-words text-sm leading-7 text-ash">{state.error}</p><button type="button" className="btn-primary mt-6" onClick={state.retry}>다시 불러오기 <ArrowIcon width={17} height={17}/></button></div>
        ) : items.length === 0 ? (
          <div className="empty-box"><p className="text-lg font-medium text-paper">시온의 Objekt 데이터가 없습니다.</p><p className="mt-3 max-w-xl text-sm leading-7 text-ash">실제 데이터에서 member 필드가 S20, S20_SHION 또는 박시온인지 확인해 주세요. 다른 멤버의 카드는 자동 제외됩니다.</p><button type="button" className="btn-ghost mt-6" onClick={state.retry}>데이터 다시 확인</button></div>
        ) : (
          <>
            {catalog?.isDemo && <div role="note" className="mb-8 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blush/15 bg-blush/[.055] px-4 py-3 text-xs leading-6 text-[#E3D6E2]"><span><b className="mr-2 font-semibold tracking-[.08em]">DEMO DATA</b> 기능 확인용 임시 카드입니다. 실제 박시온 Objekt 카탈로그를 연결하면 자동 교체됩니다.</span><span className="text-ash">S20 FILTER / ACTIVE</span></div>}
            {screen === 'collection' ? <Collection items={items} favorites={favorites} onToggleFavorite={toggleFavorite}/> : <TournamentArena items={items} isDemo={!!catalog?.isDemo} favorites={favorites} onToggleFavorite={toggleFavorite}/>}
          </>
        )}
      </main>
      <footer className="border-t border-white/[.08] px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1384px] flex-wrap items-center justify-between gap-4 text-[11px] text-ash"><div><span className="font-semibold tracking-[.13em] text-paper">SHION ARCHIVE</span><span className="mx-3 text-white/20">/</span> fan-made, non-official project</div><div className="tracking-[.08em]">CREATED BY <span className="font-semibold text-blush">@bbangshion</span> <span className="mx-2 text-white/20">·</span> S20 PARK SHION</div></div></footer>
    </div>
  );
}

export default function App() {
  return <ArchiveProvider><ArchiveApp /></ArchiveProvider>;
}
