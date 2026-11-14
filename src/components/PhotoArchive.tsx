import { Trans, useI18n } from '../i18n/I18nContext';
import { createPortal } from 'react-dom';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { Objekt } from '../types/objekt';
import { objektLabel } from './ObjektArtwork';
type Photo = {
    id: string;
    imageUrl: string;
    title: string;
    category: 'photo' | 'objekt';
    season: string;
    description: string;
};
type PhotoRecord = Record<string, unknown>;
type Group = 'all' | 'photo' | 'objekt';
const HERO = `${import.meta.env.BASE_URL}images/shion-home.jpg`;
const FIRST_PHOTO: Photo = {
    id: 'shion-home', imageUrl: HERO, title: '공항에서', category: 'photo',
    season: '사진', description: '사용자가 제공한 사진',
};
const BATCH = 36;
function isObject(value: unknown): value is PhotoRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function safeImageUrl(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim())
        return null;
    const clean = value.trim();
    if (/^https:\/\//i.test(clean))
        return clean;
    if (/^http:\/\//i.test(clean))
        return null;
    if (/^(?!\/\/)(?!\.\.\/)[a-zA-Z0-9_./%\-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(clean)) {
        return `${import.meta.env.BASE_URL}${clean.replace(/^\.?\//, '')}`;
    }
    return null;
}
function parsePhotos(raw: unknown): Photo[] {
    if (!Array.isArray(raw))
        return [FIRST_PHOTO];
    const photos: Photo[] = [];
    for (const candidate of raw) {
        if (!isObject(candidate))
            continue;
        const imageUrl = safeImageUrl(candidate.image);
        if (!imageUrl)
            continue;
        const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
        if (!id || photos.some((photo) => photo.id === `user-${id}`))
            continue;
        photos.push({
            id: `user-${id}`,
            imageUrl,
            category: 'photo',
            title: typeof candidate.title === 'string' && candidate.title.trim() ? candidate.title.trim() : '박시온',
            season: typeof candidate.album === 'string' && candidate.album.trim() ? candidate.album.trim() : '사진',
            description: typeof candidate.credit === 'string' ? candidate.credit.trim() : '',
        });
    }
    return photos.length ? photos : [FIRST_PHOTO];
}
function GalleryTile({ photo, onOpen }: {
    photo: Photo;
    onOpen: () => void;
}) {
    const { t } = useI18n();
    const [broken, setBroken] = useState(false);
    useEffect(() => setBroken(false), [photo.imageUrl]);
    return (<button className="shion-gallery-tile" type="button" onClick={onOpen} aria-label={`${t(photo.title)} ${t("사진 확대")}`}>
      <div className={`shion-gallery-image ${photo.category === 'objekt' ? 'is-objekt' : ''}`}>
        {broken ? (<span className="shion-gallery-image-error"><Trans value="이미지를 표시할 수 없습니다"/></span>) : (<img src={photo.imageUrl} alt={t(photo.title)} loading="lazy" decoding="async" onError={() => setBroken(true)}/>)}
      </div>
      <div className="shion-gallery-meta"><strong>{t(photo.title)}</strong><span>{t(photo.season)}</span></div>
    </button>);
}
export function PhotoArchive({ objekts, loading, error }: {
    objekts: Objekt[];
    loading: boolean;
    error?: string;
}) {
    const { t, formatNumber } = useI18n();
    const [photos, setPhotos] = useState<Photo[]>([FIRST_PHOTO]);
    const [group, setGroup] = useState<Group>('all');
    const [album, setAlbum] = useState('all');
    const [query, setQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(BATCH);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase('ko-KR'));
    useEffect(() => {
        const controller = new AbortController();
        fetch(`${import.meta.env.BASE_URL}data/photos.json`, { signal: controller.signal })
            .then((res) => { if (!res.ok)
            throw new Error('No photo archive'); return res.json(); })
            .then((data: unknown) => { if (!controller.signal.aborted)
            setPhotos(parsePhotos(data)); })
            .catch(() => { if (!controller.signal.aborted)
            setPhotos([FIRST_PHOTO]); });
        return () => controller.abort();
    }, []);
    const gallery = useMemo(() => {
        const artwork: Photo[] = objekts.filter((objekt) => !!objekt.imageUrl && !objekt.isDemo).map((objekt) => ({
            id: `objekt-${objekt.id}`, imageUrl: objekt.imageUrl!, title: `${objekt.season} ${objektLabel(objekt)}`,
            category: 'objekt', season: objekt.season, description: `${objekt.season} · ${objekt.className}`,
        }));
        return [...photos, ...artwork];
    }, [photos, objekts]);
    const albums = useMemo(() => Array.from(new Set(gallery.filter((photo) => group === 'all' || photo.category === group).map((photo) => photo.season))).sort((a, b) => a.localeCompare(b, 'ko', { numeric: true })), [gallery, group]);
    const filtered = useMemo(() => gallery.filter((photo) => (group === 'all' || group === photo.category) &&
        (album === 'all' || photo.season === album) &&
        (!deferredQuery || `${photo.title} ${photo.season} ${photo.description}`.toLocaleLowerCase('ko-KR').includes(deferredQuery))), [gallery, group, album, deferredQuery]);
    const visible = filtered.slice(0, visibleCount);
    const currentIndex = selectedId ? filtered.findIndex((photo) => photo.id === selectedId) : -1;
    const selected = currentIndex >= 0 ? filtered[currentIndex] : null;
    const close = () => setSelectedId(null);
    const navigate = (direction: -1 | 1) => {
        if (!filtered.length || currentIndex < 0)
            return;
        const nextIndex = (currentIndex + direction + filtered.length) % filtered.length;
        setSelectedId(filtered[nextIndex]?.id ?? null);
        setFailed(false);
    };
    useEffect(() => { setVisibleCount(BATCH); }, [group, album, deferredQuery]);
    useEffect(() => {
        if (!selected)
            return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape')
                close();
            if (event.key === 'ArrowLeft')
                navigate(-1);
            if (event.key === 'ArrowRight')
                navigate(1);
        };
        document.addEventListener('keydown', onKey);
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('shion-gallery-open');
        document.getElementById('shion-photo-close')?.focus();
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow; document.body.classList.remove('shion-gallery-open'); previousFocus?.focus(); };
        // Keep keyboard navigation synchronized with currently selected image.
    }, [selectedId, filtered]);
    return (<section className="shion-photos animate-appear" aria-labelledby="photos-heading">
      <header className="shion-page-heading">
        <span className="shion-page-kicker">PHOTO ARCHIVE</span>
        <h1 id="photos-heading"><Trans value="사진"/></h1>
        <p><Trans value="박시온의 사진과 오브젝트 이미지"/></p>
      </header>
      <div className="shion-photo-controls">
        <div className="shion-photo-tabs" role="group" aria-label={t("사진 종류")}>
          {([
            ['all', '전체'], ['photo', '사진'], ['objekt', '오브젝트 이미지'],
        ] as const).map(([key, label]) => (<button type="button" key={key} aria-pressed={group === key} className={group === key ? 'is-active' : ''} onClick={() => { setGroup(key); setAlbum('all'); }}>{t(label)}</button>))}
        </div>
        <div className="shion-photo-filters">
          <label><span className="sr-only"><Trans value="사진 검색"/></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("제목, 시즌 검색")} type="search" maxLength={100}/></label>
          <label><span className="sr-only"><Trans value="앨범 선택"/></span><select value={album} onChange={(event) => setAlbum(event.target.value)}><option value="all">{t("모든 앨범")}</option>{albums.map((name) => <option key={name} value={name}>{t(name)}</option>)}</select></label>
        </div>
      </div>
      <div className="shion-photo-result"><span aria-live="polite">{formatNumber(filtered.length)}<Trans value="개 이미지"/></span><span>{formatNumber(visible.length)}<Trans value="개 표시"/></span></div>
      {filtered.length ? (<>
          <div className="shion-photo-grid">{visible.map((photo) => <GalleryTile key={photo.id} photo={photo} onOpen={() => { setSelectedId(photo.id); setFailed(false); }}/>)}</div>
          {visibleCount < filtered.length && <button type="button" className="shion-photo-more" onClick={() => setVisibleCount((n) => n + BATCH)}><Trans value="더 보기"/></button>}
        </>) : (<div className="shion-photo-empty"><Trans value="조건에 맞는 이미지가 없습니다"/></div>)}
      <p className="shion-source-note"><Trans value="오브젝트 이미지는 WAV ARCHIVE 데이터에서 불러옵니다. 사진은 별도의 자료로 관리합니다."/></p>
      {loading && <p className="shion-source-note" role="status"><Trans value="오브젝트 이미지를 불러오는 중입니다"/></p>}
      {error && <p className="shion-source-note" role="status"><Trans value="오브젝트 이미지를 연결하지 못했습니다: "/>{t(error)}</p>}
      {selected && createPortal(<div className="shion-lightbox" role="dialog" aria-modal="true" aria-label={`${t(selected.title)} ${t("사진 확대")}`} onMouseDown={(event) => { if (event.target === event.currentTarget)
            close(); }}>
          <div className="shion-lightbox-top"><span>{currentIndex + 1} / {filtered.length}</span><button type="button" onClick={close} autoFocus aria-label={t("닫기")} id="shion-photo-close"><Trans value="닫기 ✕"/></button></div>
          <div className="shion-lightbox-stage">
            <button className="shion-lightbox-step" type="button" aria-label={t("이전 사진")} onClick={() => navigate(-1)}>‹</button>
            {failed ? <div className="shion-lightbox-failed"><Trans value="이미지를 표시할 수 없습니다"/></div> : <img key={selected.id} src={selected.imageUrl} alt={t(selected.title)} onError={() => setFailed(true)}/>}
            <button className="shion-lightbox-step" type="button" aria-label={t("다음 사진")} onClick={() => navigate(1)}>›</button>
          </div>
          <div className="shion-lightbox-caption"><strong>{t(selected.title)}</strong><span>{t(selected.description)}</span></div>
        </div>, document.body)}
    </section>);
}
