import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n/I18nContext';

type LocalizedText = { ko: string; en?: string; ja?: string };
type Photo = {
  id: string;
  image: string;
  title: LocalizedText;
  album: LocalizedText;
  date: string | null;
  credit: LocalizedText | null;
  source: string | null;
  tags: string[];
};
type PhotoRecord = Record<string, unknown>;
type PhotoSourceRef = {
  id: string;
  memberId: 'S20';
  year: string;
  title: LocalizedText;
  album: LocalizedText;
  sourceUrl: string;
  kind: 'photo-reference';
};
type SocialSource = { id: string; date: string; sourceUrl: string; mediaCountReported: number; title: LocalizedText; memberId: 'S20' };
function validSourceRefs(payload: unknown): PhotoSourceRef[] {
  if (!Array.isArray(payload)) return [];
  const ids = new Set<string>();
  return payload.flatMap((item: unknown): PhotoSourceRef[] => {
    if (!isRecord(item) || item.memberId !== 'S20' || item.kind !== 'photo-reference') return [];
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const url = sourceURL(item.sourceUrl);
    const year = typeof item.year === 'string' && /^20\d\d$/.test(item.year) ? item.year : '';
    if (!id || ids.has(id) || !url || !year) return [];
    ids.add(id);
    return [{ id, memberId: 'S20', kind: 'photo-reference', year, sourceUrl: url, title: localized(item.title, '박시온 사진 자료'), album: localized(item.album, '사진 자료') }];
  });
}
function validSocialSources(payload: unknown): SocialSource[] {
  if (!Array.isArray(payload)) return [];
  const ids = new Set<string>();
  return payload.flatMap((item: unknown): SocialSource[] => {
    if (!isRecord(item) || item.memberId !== 'S20' || typeof item.id !== 'string') return [];
    const url = sourceURL(item.sourceUrl);
    const count = typeof item.mediaCountReported === 'number' ? item.mediaCountReported : 0;
    if (!url || ids.has(item.id) || !Number.isInteger(count) || count < 1 || count > 30) return [];
    ids.add(item.id);
    return [{id:item.id, memberId:'S20', date:typeof item.date==='string'?item.date:'', sourceUrl:url, mediaCountReported:count, title:localized(item.title, '공식 SNS 자료')}];
  });
}
type SortOrder = 'newest' | 'oldest';
type ViewMode = 'date' | 'album';
const BASE = import.meta.env.BASE_URL;
const PAGE_SIZE = 36;
const FALLBACK: Photo = {
  id: 'airport-photo', image: `${BASE}images/shion-home.jpg`,
  title: { ko: '공항에서', en: 'At the airport', ja: '空港にて' },
  album: { ko: '일상', en: 'Daily life', ja: '日常' },
  date: null,
  credit: { ko: '사용자 제공 사진', en: 'User-provided photo', ja: 'ユーザー提供写真' },
  source: null, tags: [],
};
function isRecord(value: unknown): value is PhotoRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function localized(value: unknown, fallback: string): LocalizedText {
  if (typeof value === 'string' && value.trim()) return { ko: value.trim() };
  if (!isRecord(value)) return { ko: fallback };
  const ko = typeof value.ko === 'string' && value.ko.trim() ? value.ko.trim() : fallback;
  return {
    ko,
    ...(typeof value.en === 'string' && value.en.trim() ? { en: value.en.trim() } : {}),
    ...(typeof value.ja === 'string' && value.ja.trim() ? { ja: value.ja.trim() } : {}),
  };
}
function imageURL(input: unknown): string | null {
  if (typeof input !== 'string' || !input.trim()) return null;
  const value = input.trim();
  if (/^https:\/\//i.test(value)) {
    try { return new URL(value).protocol === 'https:' ? value : null; } catch { return null; }
  }
  if (!/^(?!\/)(?!\.)(?!.*\/\.?\.\/)[a-z\d_./%\-]+\.(?:jpe?g|png|webp|avif)$/i.test(value)) return null;
  return `${BASE}${value}`;
}
function sourceURL(input: unknown): string | null {
  if (typeof input !== 'string' || !/^https:\/\//i.test(input.trim())) return null;
  try { return new URL(input.trim()).protocol === 'https:' ? input.trim() : null; } catch { return null; }
}
function validDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value ? value : null;
}
/** Photo-only import: data belonging to Objekt (or any other category) is always rejected. */
function readPhotos(payload: unknown): Photo[] {
  const items = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.photos) ? payload.photos : [];
  const ids = new Set<string>();
  const results: Photo[] = [];
  for (const raw of items) {
    if (!isRecord(raw)) continue;
    if (typeof raw.category === 'string' && raw.category.toLowerCase() !== 'photo') continue;
    if (typeof raw.type === 'string' && raw.type.toLowerCase() !== 'photo') continue;
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const image = imageURL(raw.image);
    if (!id || !image || ids.has(id)) continue;
    if (/(^|\/)objekt(?:-collection)?\//i.test(image)) continue;
    ids.add(id);
    results.push({
      id, image,
      title: localized(raw.title, '박시온'),
      album: localized(raw.album, '사진'),
      date: validDate(raw.date),
      credit: raw.credit ? localized(raw.credit, '') : null,
      source: sourceURL(raw.sourceUrl ?? raw.source),
      tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 20) : [],
    });
  }
  return results;
}
function dateKey(photo: Photo): string { return photo.date?.slice(0, 7) ?? 'unknown'; }
function comparePhotos(a: Photo, b: Photo, order: SortOrder): number {
  if (a.date && !b.date) return -1;
  if (b.date && !a.date) return 1;
  const diff = (a.date ?? '').localeCompare(b.date ?? '');
  return (order === 'newest' ? -diff : diff) || a.id.localeCompare(b.id);
}
function PhotoTile({ photo, title, album, onClick }: {
  photo: Photo;
  title: string;
  album: string;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [photo.image]);
  return <button type="button" className="shion-gallery-tile" onClick={onClick} aria-label={`${title} — ${t('사진 확대')}`}>
    <span className="shion-gallery-image">
      {broken ? <span className="shion-gallery-image-error">{t('이미지를 표시할 수 없습니다')}</span>
        : <img src={photo.image} alt={title} loading="lazy" decoding="async" onError={() => setBroken(true)}/>}
    </span>
    <span className="shion-gallery-meta"><strong>{title}</strong><span>{album}</span></span>
  </button>;
}
// Accept legacy props during staged GitHub uploads; photo data never uses Objekt.
export function PhotoArchive(_legacyProps?: { objekts?: unknown[]; loading?: boolean; error?: string }) {
  const { language, t, formatNumber } = useI18n();
  const [photos, setPhotos] = useState<Photo[]>([FALLBACK]);
  const [sourceRefs, setSourceRefs] = useState<PhotoSourceRef[]>([]);
  const [socialSources, setSocialSources] = useState<SocialSource[]>([]);
  const [sourceTab, setSourceTab] = useState<'photos' | 'sources'>('photos');
  const [referenceLimit, setReferenceLimit] = useState(48);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [year, setYear] = useState('all');
  const [month, setMonth] = useState('all');
  const [album, setAlbum] = useState('all');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [mode, setMode] = useState<ViewMode>('date');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brokenDetail, setBrokenDetail] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<number | null>(null);
  const deferred = useDeferredValue(query.trim().toLocaleLowerCase());
  const text = (label: LocalizedText): string => label[language] || t(label.ko);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${BASE}data/photos.json`, { signal: controller.signal, cache: 'no-cache' })
      .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then((payload: unknown) => { if (!controller.signal.aborted) { setPhotos(readPhotos(payload)); setLoadError(false); } })
      .catch(() => { if (!controller.signal.aborted) { setPhotos([FALLBACK]); setLoadError(true); } })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const read = async (file: string) => {
      const response = await fetch(`${BASE}data/${file}`, { signal: controller.signal, cache: 'no-cache' });
      if (!response.ok) return [];
      return response.json() as Promise<unknown>;
    };
    Promise.all([read('photo-source-index.json'), read('photo-social-sources.json')])
      .then(([index, posts]) => {
        if (controller.signal.aborted) return;
        setSourceRefs(validSourceRefs(index));
        setSocialSources(validSocialSources(posts));
      }).catch(() => { /* Keep the existing gallery working if the optional index is unavailable. */ });
    return () => controller.abort();
  }, []);
  const referenceRows = useMemo(() => sourceRefs.filter(item =>
    (year === 'all' || item.year === year) &&
    (!deferred || `${item.title.ko} ${item.title.en ?? ''} ${item.album.ko} ${item.year}`.toLowerCase().includes(deferred))
  ).sort((a,b) => (sort === 'newest' ? -1 : 1) * a.year.localeCompare(b.year) || a.id.localeCompare(b.id)), [sourceRefs, year, deferred, sort]);
  const sourceYearOptions = useMemo(() => [...new Set(sourceRefs.map(item => item.year))].sort().reverse(), [sourceRefs]);
  const years = useMemo(() => [...new Set([...photos.flatMap((photo) => photo.date ? [photo.date.slice(0, 4)] : []), ...sourceYearOptions])].sort().reverse(), [photos, sourceYearOptions]);
  const months = useMemo(() => [...new Set(photos.flatMap((photo) => photo.date && (year === 'all' || photo.date.startsWith(year)) ? [photo.date.slice(5, 7)] : []))].sort(), [photos, year]);
  const albums = useMemo(() => [...new Set(photos.map((photo) => photo.album.ko))].sort((a, b) => a.localeCompare(b, 'ko')), [photos]);
  const albumNames = useMemo(() => new Map(photos.map((photo) => [photo.album.ko, text(photo.album)])), [photos, language]);
  const filtered = useMemo(() => photos.filter((photo) =>
    (year === 'all' || photo.date?.startsWith(year)) &&
    (month === 'all' || photo.date?.slice(5, 7) === month) &&
    (album === 'all' || photo.album.ko === album) &&
    (!deferred || [photo.title.ko, photo.title.en, photo.title.ja, photo.album.ko, photo.album.en,
      photo.album.ja, photo.date, photo.credit?.ko, ...photo.tags]
      .filter(Boolean).join(' ').toLocaleLowerCase().includes(deferred))
  ).sort((a, b) => comparePhotos(a, b, sort)), [photos, year, month, album, deferred, sort]);
  const visible = filtered.slice(0, limit);
  const groups = useMemo(() => {
    const collected = new Map<string, Photo[]>();
    for (const photo of visible) {
      const key = mode === 'album' ? photo.album.ko : dateKey(photo);
      const list = collected.get(key) ?? [];
      list.push(photo);
      collected.set(key, list);
    }
    return [...collected.entries()];
  }, [visible, mode]);
  const currentIndex = selectedId === null ? -1 : filtered.findIndex((photo) => photo.id === selectedId);
  const selected = currentIndex < 0 ? null : filtered[currentIndex] ?? null;
  const close = () => setSelectedId(null);
  const step = (direction: -1 | 1) => {
    if (currentIndex < 0 || filtered.length === 0) return;
    setSelectedId(filtered[(currentIndex + direction + filtered.length) % filtered.length]?.id ?? null);
  };
  useEffect(() => { setLimit(PAGE_SIZE); setReferenceLimit(48); }, [year, month, album, sort, deferred, mode, sourceTab]);
  useEffect(() => { setBrokenDetail(false); }, [selectedId]);
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'Tab') {
        const controls = document.querySelectorAll<HTMLButtonElement>('.shion-lightbox button, .shion-lightbox a[href]');
        const first = controls.item(0);
        const last = controls.item(controls.length - 1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; previous?.focus(); };
  }, [selectedId, filtered]);
  const reset = () => { setYear('all'); setMonth('all'); setAlbum('all'); setQuery(''); setSort('newest'); };
  const photoDate = (date: string | null) => date ?? t('날짜 미상');
  const monthLabel = (monthValue: string) => new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'ko-KR', { month: 'long' }).format(new Date(2020, Number(monthValue) - 1, 1));
  const groupLabel = (key: string) => mode === 'album'
    ? (albumNames.get(key) ?? key)
    : (key === 'unknown' ? t('날짜 미상') : `${key.replace('-', '.')}`);

  return <section className="shion-photos shion-photo-v2 animate-appear" aria-labelledby="photos-heading">
    <header className="shion-page-heading">
      <span className="shion-page-kicker">PHOTO ARCHIVE</span>
      <h1 id="photos-heading">{t('사진')}</h1>
      <p>{t('박시온 사진을 날짜와 앨범으로 모아봤어요')}</p>
      <p className="shion-source-note">{language === 'en' ? 'Curated by @bbangshion' : language === 'ja' ? 'アーカイブ編集 · @bbangshion' : '아카이브 정리 · @bbangshion'}</p>
    </header>
    <div className="shion-photo-source-switch" role="group" aria-label={language === 'ja' ? '表示対象' : language === 'en' ? 'Gallery section' : '갤러리 구분'}>
      <button type="button" className={sourceTab === 'photos' ? 'is-active' : ''} aria-pressed={sourceTab === 'photos'} onClick={() => setSourceTab('photos')}>
        {language === 'ja' ? '写真' : language === 'en' ? 'Photos' : '사진'} <span>{formatNumber(photos.length)}</span>
      </button>
      <button type="button" className={sourceTab === 'sources' ? 'is-active' : ''} aria-pressed={sourceTab === 'sources'} onClick={() => setSourceTab('sources')}>
        {language === 'ja' ? '資料を探す' : language === 'en' ? 'Source index' : '사진 출처 찾기'} <span>{formatNumber(sourceRefs.length)}</span>
      </button>
    </div>
    {sourceTab === 'sources' && <p className="shion-source-explanation">{language === 'ja' ? 'ここは写真の掲載枚数ではなく、元画像を確認するための資料リストです。画像・使用許諾の確認前に写真として追加しません。' : language === 'en' ? 'This is a reference index, not a count of displayed photos. Each image and reuse permission needs separate verification.' : '여기는 실제 표시된 사진이 아니라 원본을 확인할 수 있는 자료 목록이야. 개별 사진 주소와 사용 조건을 확인한 뒤 갤러리에 추가해.'}</p>}
    <div className="shion-photo-controls">
      {sourceTab === 'photos' && <div className="shion-photo-view-tabs" role="group" aria-label={t('사진 보기 방식')}>
        <button type="button" className={mode === 'date' ? 'is-active' : ''} aria-pressed={mode === 'date'} onClick={() => setMode('date')}>{t('날짜별')}</button>
        <button type="button" className={mode === 'album' ? 'is-active' : ''} aria-pressed={mode === 'album'} onClick={() => setMode('album')}>{t('앨범별')}</button>
      </div>}
      <div className="shion-photo-filters">
        <label className="shion-photo-search"><span className="sr-only">{t('사진 검색')}</span>
          <input type="search" value={query} maxLength={100} placeholder={t('사진 제목, 앨범, 키워드 검색')} onChange={(e) => setQuery(e.target.value)}/>
        </label>
        <label><span className="sr-only">{t('연도 선택')}</span><select value={year} onChange={(e) => { setYear(e.target.value); setMonth('all'); }}>
          <option value="all">{t('전체 연도')}</option>{years.map((item) => <option value={item} key={item}>{item}</option>)}
        </select></label>
        {sourceTab === 'photos' && <label><span className="sr-only">{t('월 선택')}</span><select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">{t('전체 월')}</option>{months.map((item) => <option value={item} key={item}>{monthLabel(item)}</option>)}
        </select></label>}
        {sourceTab === 'photos' && <label><span className="sr-only">{t('앨범 선택')}</span><select value={album} onChange={(e) => setAlbum(e.target.value)}>
          <option value="all">{t('모든 앨범')}</option>{albums.map((name) => <option value={name} key={name}>{albumNames.get(name) ?? name}</option>)}
        </select></label>}
        <label><span className="sr-only">{t('정렬')}</span><select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
          <option value="newest">{t('최신순')}</option><option value="oldest">{t('오래된순')}</option>
        </select></label>
      </div>
    </div>
    <div className="shion-photo-result" aria-live="polite">
      <span>{sourceTab === 'photos' ? `${formatNumber(filtered.length)} ${t('장')}` : `${formatNumber(referenceRows.length)} ${language === 'ja' ? '件の資料' : language === 'en' ? 'references' : '개 자료'}`}</span>
      <button type="button" className="shion-photo-reset" onClick={reset}>{t('필터 초기화')}</button>
    </div>
    {sourceTab === 'photos' ? <>
    {isLoading ? <div role="status" className="shion-photo-empty">{t('사진을 불러오는 중')}</div> : filtered.length === 0 ?
      <div className="shion-photo-empty">{t('조건에 맞는 사진이 없습니다')}</div> : <>
        {groups.map(([key, list]) => <section className="shion-photo-group" key={`${mode}-${key}`} aria-label={groupLabel(key)}>
          <div className="shion-photo-group-head"><h2>{groupLabel(key)}</h2><span>{formatNumber(list.length)} {t('장')}</span></div>
          <div className="shion-photo-grid">{list.map((photo) =>
            <PhotoTile key={photo.id} photo={photo} title={text(photo.title)} album={text(photo.album)} onClick={() => setSelectedId(photo.id)}/>)}</div>
        </section>)}
        {limit < filtered.length && <button className="shion-photo-more" type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)}>{t('더 보기')}</button>}
      </>}
    </> : <div className="shion-reference-section">
      {socialSources.length > 0 && <section aria-label="Social source pages" className="shion-social-source-section">
        <h2>{language === 'ja' ? '公式SNS 写真の掲載元' : language === 'en' ? 'Official social post references' : '공식 SNS 게시물 출처'}</h2>
        <p>{language === 'ja' ? '個別写真を複製せず、元の投稿やアーカイブ資料に移動します。' : language === 'en' ? 'Links lead to indexed social posts; image files are not mirrored.' : '게시물에 포함된 사진 수를 참고할 수 있어. 실제 사진 파일은 이 목록에서 복제하지 않아.'}</p>
        <div className="shion-source-cards">
          {socialSources.filter(item => year === 'all' || item.date.startsWith(year)).slice(0, 24).map(item =>
            <a key={item.id} href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="shion-source-card">
              <span className="shion-source-card-type">SNS · {item.date}</span>
              <strong>{text(item.title)}</strong>
              <small>{language === 'ja' ? '掲載元を見る' : language === 'en' ? 'Open source' : '출처 페이지 열기'} ↗</small>
            </a>)}
        </div>
      </section>}
      <h2>{language === 'ja' ? '写真の参照項目' : language === 'en' ? 'Photo reference entries' : '사진 출처 목록'}</h2>
      <div className="shion-source-cards">
        {referenceRows.slice(0, referenceLimit).map(item =>
          <a key={item.id} href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="shion-source-card">
            <span className="shion-source-card-type">{item.year} · S20</span>
            <strong>{text(item.title)}</strong>
            <small>{language === 'ja' ? 'ギャラリー資料を見る' : language === 'en' ? 'View gallery reference' : '원본 자료에서 확인'} ↗</small>
          </a>)}
      </div>
      {referenceLimit < referenceRows.length && <button className="shion-photo-more" type="button" onClick={() => setReferenceLimit(n=>n+48)}>{t('더 보기')}</button>}
    </div>}
    {sourceTab === 'photos' && loadError && <p className="shion-source-note" role="status">{t('사진 목록을 불러오지 못해 기본 사진을 표시합니다')}</p>}
    <p className="shion-source-note">{t('사진은 출처가 확인된 자료를 기준으로 등록합니다')}</p>
    {selected && createPortal(<div role="dialog" aria-modal="true" aria-label={`${text(selected.title)} — ${t('사진 확대')}`}
      className="shion-lightbox" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="shion-lightbox-top"><span>{formatNumber(currentIndex + 1)} / {formatNumber(filtered.length)}</span>
        <button type="button" ref={closeButton} id="shion-photo-close" onClick={close} aria-label={t('닫기')}>{t('닫기')} ×</button>
      </div>
      <div className="shion-lightbox-stage" onTouchStart={(event) => { swipeStart.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => { const last = event.changedTouches[0]?.clientX; if (last !== undefined && swipeStart.current !== null && Math.abs(last - swipeStart.current) > 65) step(last < swipeStart.current ? 1 : -1); swipeStart.current = null; }}>
        <button className="shion-lightbox-step" type="button" onClick={() => step(-1)} aria-label={t('이전 사진')}>‹</button>
        {brokenDetail ? <div className="shion-lightbox-failed">{t('이미지를 표시할 수 없습니다')}</div> :
          <img key={selected.id} src={selected.image} alt={text(selected.title)} onError={() => setBrokenDetail(true)} decoding="async"/>}
        <button className="shion-lightbox-step" type="button" onClick={() => step(1)} aria-label={t('다음 사진')}>›</button>
      </div>
      <div className="shion-lightbox-caption shion-lightbox-caption-v2"><div><strong>{text(selected.title)}</strong>
        <span>{text(selected.album)} · {photoDate(selected.date)}</span>
        {selected.credit && <span>{selected.id.startsWith('fandom-s20-') ? text(selected.credit) : `${t('출처')}: ${text(selected.credit)}`}</span>}</div>
        {selected.source && <a href={selected.source} target="_blank" rel="noopener noreferrer">{t('원본 게시물')}</a>}
      </div>
    </div>, document.body)}
  </section>;
}
