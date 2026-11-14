import { useEffect, useState } from 'react';
import { Collection } from './components/Collection';
import { TournamentArena } from './components/TournamentArena';
import { ProfilePage } from './components/ProfilePage';
import { PhotoArchive } from './components/PhotoArchive';
import { ArrowIcon } from './components/Icons';
import { ArchiveProvider, useArchive } from './state/ArchiveContext';
import type { ArchiveScreen } from './state/ArchiveContext';

const PHOTO_URL = `${import.meta.env.BASE_URL}images/shion-home.jpg`;

const MENU: readonly { key: ArchiveScreen; label: string; number: string }[] = [
  { key: 'home', label: '홈', number: '01' },
  { key: 'profile', label: '프로필', number: '02' },
  { key: 'photos', label: '사진', number: '03' },
  { key: 'collection', label: '오브젝트', number: '04' },
  { key: 'worldcup', label: '월드컵', number: '05' },
];

function SiteHeader() {
  const { screen, setScreen } = useArchive();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [screen]);
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.body.classList.add('shion-menu-open');
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('shion-menu-open');
    };
  }, [menuOpen]);

  const navigate = (next: ArchiveScreen) => {
    setScreen(next);
    setMenuOpen(false);
  };

  return (
    <>
      <header className={`shion-site-header ${screen === 'home' ? 'on-home' : 'on-subpage'}`}>
        <div className="shion-header-inner">
          <a
            className="shion-brand"
            href={import.meta.env.BASE_URL}
            onClick={(event) => { event.preventDefault(); navigate('home'); }}
            aria-label="SHION ARCHIVE 홈으로"
          >
            <span className="shion-brand-mark" aria-hidden="true">S</span>
            <span className="shion-brand-name">SHION <span>ARCHIVE</span></span>
          </a>

          <nav className="shion-desktop-nav" aria-label="주 메뉴">
            {MENU.map((item) => (
              <button key={item.key} type="button" className={screen === item.key ? 'is-active' : ''} aria-current={screen === item.key ? 'page' : undefined} onClick={() => navigate(item.key)}>{item.label}</button>
            ))}
          </nav>
          <div className="shion-header-right">
            <span className="shion-header-tag">TRIPLES S20</span>
            <button
              type="button"
              className={`shion-menu-toggle ${menuOpen ? 'is-open' : ''}`}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
              aria-controls="shion-mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span/><span/>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <button type="button" className="shion-menu-backdrop" aria-label="메뉴 닫기" onClick={() => setMenuOpen(false)}/>}
      <nav id="shion-mobile-menu" aria-label="모바일 메뉴" className={`shion-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen} hidden={!menuOpen}>
        <div className="shion-menu-eyebrow">SHION ARCHIVE</div>
        {MENU.map((item) => (
          <button key={item.key} type="button" className={`shion-mobile-link ${screen === item.key ? 'is-active' : ''}`} aria-current={screen === item.key ? 'page' : undefined} onClick={() => navigate(item.key)}>
            <span className="shion-mobile-index">{item.number}</span>
            <span>{item.label}</span>
            <ArrowIcon width={19} height={19}/>
          </button>
        ))}
        <p>tripleS 박시온 팬 아카이브</p>
      </nav>
    </>
  );
}

function Home() {
  const { setScreen, catalogState, favorites } = useArchive();
  const count = catalogState.status === 'ready' ? catalogState.catalog.items.length.toLocaleString('ko-KR') : '—';

  return (
    <main id="main-content" className="shion-home">
      <section className="shion-hero" aria-labelledby="shion-hero-title">
        <div className="shion-hero-image">
          <img src={PHOTO_URL} alt="공항에서 촬영한 박시온 사진" width="1152" height="1536" fetchPriority="high" decoding="async"/>
        </div>
        <div className="shion-hero-gradient" aria-hidden="true"/>
        <div className="shion-hero-inner">
          <div className="shion-hero-copy">
            <p className="shion-hero-overline">TRIPLES S20 <span/> PARK SHION</p>
            <h1 id="shion-hero-title">PARK<br/>SHION</h1>
            <p className="shion-hero-ko">박시온</p>
            <div className="shion-hero-rule"/>
            <p className="shion-hero-description">박시온의 사진과 기록을 모아둔 팬 아카이브</p>
            <div className="shion-hero-actions">
              <button type="button" className="shion-hero-primary" onClick={() => setScreen('profile')}>프로필 보기 <ArrowIcon width={17} height={17}/></button>
              <button type="button" className="shion-hero-secondary" onClick={() => setScreen('photos')}>사진 보기 <ArrowIcon width={17} height={17}/></button>
            </div>
          </div>
          <span className="shion-hero-side" aria-hidden="true">SHION ARCHIVE — S20</span>
        </div>
        <div className="shion-scroll-note" aria-hidden="true"><span/> SCROLL TO EXPLORE</div>
      </section>

      <section className="shion-home-explore" aria-labelledby="shion-explore-title">
        <div className="shion-content-width">
          <div className="shion-section-lead">
            <div>
              <p className="shion-section-eyebrow">ARCHIVE / S20</p>
              <h2 id="shion-explore-title">둘러보기</h2>
            </div>
            <p>박시온의 프로필과 사진, 오브젝트를 살펴보세요</p>
          </div>
          <div className="shion-feature-grid">
            <button type="button" className="shion-feature-card" onClick={() => setScreen('profile')}>
              <span className="shion-feature-top"><span>01 / PROFILE</span><ArrowIcon width={21} height={21}/></span>
              <span className="shion-feature-bottom"><strong>프로필</strong><span>기본 정보와 활동 유닛</span></span>
            </button>
            <button type="button" className="shion-feature-card" onClick={() => setScreen('photos')}>
              <span className="shion-feature-top"><span>02 / PHOTO</span><ArrowIcon width={21} height={21}/></span>
              <span className="shion-feature-bottom"><strong>사진</strong><span>박시온 사진과 오브젝트 이미지</span></span>
            </button>
            <button type="button" className="shion-feature-card" onClick={() => setScreen('collection')}>
              <span className="shion-feature-top"><span>03 / COLLECTION</span><ArrowIcon width={21} height={21}/></span>
              <span className="shion-feature-bottom"><strong>오브젝트 컬렉션</strong><span>시즌별 카드 검색과 즐겨찾기</span><small>{catalogState.status === 'loading' ? '불러오는 중' : `${count}개 카드`}</small></span>
            </button>
            <button type="button" className="shion-feature-card" onClick={() => setScreen('worldcup')}>
              <span className="shion-feature-top"><span>04 / WORLD CUP</span><ArrowIcon width={21} height={21}/></span>
              <span className="shion-feature-bottom"><strong>오브젝트 월드컵</strong><span>두 장씩 비교하며 최애 카드 고르기</span><small>즐겨찾기 {favorites.size.toLocaleString('ko-KR')}개</small></span>
            </button>
          </div>
          <div className="shion-home-footnote"><span>S20 · PARK SHION</span><span>CREATED BY @bbangshion</span></div>
        </div>
      </section>
    </main>
  );
}

function LoadingView() {
  return <div role="status" aria-label="오브젝트 불러오는 중" className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <div key={i}><div className="aspect-[3/4] animate-pulse rounded-lg bg-raised"/><div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-raised"/></div>)}</div>;
}

function ArchivePage() {
  const { screen, setScreen, catalogState: state, favorites, toggleFavorite } = useArchive();
  const catalog = state.status === 'ready' ? state.catalog : null;
  const items = catalog?.items ?? [];

  return (
    <main id="main-content" className="shion-subpage">
      <div className="shion-content-width">
        <div className="shion-page-crumb">
          <button type="button" onClick={() => setScreen('home')}>홈</button>
          <span aria-hidden="true">/</span>
          <span>{screen === 'collection' ? '오브젝트' : screen === 'worldcup' ? '월드컵' : screen === 'profile' ? '프로필' : '사진'}</span>
        </div>
        {screen === 'profile' ? <ProfilePage/> : screen === 'photos' ? <PhotoArchive objekts={items} loading={state.status === 'loading'} error={state.status === 'error' ? state.error : undefined}/> : state.status === 'loading' ? <LoadingView/> : state.status === 'error' ? (
          <div role="alert" className="empty-box"><p className="text-lg font-medium text-paper">오브젝트를 불러오지 못했어요</p><p className="mt-3 max-w-xl break-words text-sm leading-7 text-ash">{state.error}</p><button type="button" className="btn-primary mt-6 gap-2" onClick={state.retry}>다시 시도 <ArrowIcon width={16} height={16}/></button></div>
        ) : items.length === 0 ? (
          <div className="empty-box"><p className="text-lg font-medium text-paper">표시할 카드가 없어요</p><p className="mt-3 max-w-xl text-sm leading-7 text-ash">연결된 데이터에서 박시온 카드를 찾지 못했습니다</p><button type="button" className="btn-ghost mt-6" onClick={state.retry}>다시 확인</button></div>
        ) : (
          <>
            {catalog?.isDemo && <div role="note" className="mb-6 rounded-lg border border-white/10 bg-surface px-4 py-3 text-xs text-ash">미리보기 데이터입니다 · 실제 카드 데이터가 연결되면 자동으로 바뀝니다</div>}
            {screen === 'collection' ? <Collection items={items} favorites={favorites} onToggleFavorite={toggleFavorite}/> : <TournamentArena items={items} isDemo={!!catalog?.isDemo} favorites={favorites} onToggleFavorite={toggleFavorite}/>}
          </>
        )}
      </div>
    </main>
  );
}

function ArchiveApp() {
  const { screen } = useArchive();
  return (
    <div className="min-h-dvh bg-canvas text-paper">
      <a className="shion-skip-link" href="#main-content">본문으로 건너뛰기</a>
      <SiteHeader/>
      {screen === 'home' ? <Home/> : <ArchivePage/>}
      <footer className="shion-footer"><div className="shion-content-width shion-footer-inner"><span>SHION ARCHIVE</span><span>tripleS S20 박시온 팬 아카이브</span><span>CREATED BY @bbangshion</span></div></footer>
    </div>
  );
}

export default function App() {
  return <ArchiveProvider><ArchiveApp/></ArchiveProvider>;
}
