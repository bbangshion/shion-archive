import { useEffect, useMemo, useState } from 'react';
import { ArrowIcon } from './Icons';
import { buildTimeline, loadOverview, retryOverview } from '../lib/overview';
import type { Overview, TimelineKind } from '../lib/overview';
import { searchLabel } from '../lib/searchIndex';
import { useArchive } from '../state/ArchiveContext';
import { Trans, useI18n } from '../i18n/I18nContext';

const FILTERS: readonly { kind: 'all' | TimelineKind; label: string }[] = [
  { kind: 'all', label: '전체' }, { kind: 'milestone', label: '주요 활동' },
  { kind: 'photos', label: '사진' }, { kind: 'film', label: '영상' },
];
const PAGE_SIZE = 24;

export function TimelinePage() {
  const { language, t, formatNumber } = useI18n();
  const { setScreen } = useArchive();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('all');
  const [kind, setKind] = useState<'all' | TimelineKind>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => {
    let alive = true;
    void loadOverview().then((value) => { if (alive) { setData(value); setLoading(false); } });
    return () => { alive = false; };
  }, []);
  const timeline = useMemo(() => buildTimeline(data ?? { photos: [], films: [], photoError: false, filmError: false }), [data]);
  const years = useMemo(() => Array.from(new Set(timeline.map((item) => item.date.slice(0, 4)))).sort().reverse(), [timeline]);
  const matches = useMemo(() => timeline.filter((item) => (year === 'all' || item.date.startsWith(year)) && (kind === 'all' || item.kind === kind)), [timeline, year, kind]);
  const chooseYear = (value: string) => { setYear(value); setVisible(PAGE_SIZE); };
  const chooseKind = (value: 'all' | TimelineKind) => { setKind(value); setVisible(PAGE_SIZE); };
  const reload = () => {
    setLoading(true);
    void retryOverview().then((result) => { setData(result); setLoading(false); });
  };
  return <div className="shion-timeline" aria-labelledby="shion-timeline-title">
    <header className="shion-page-heading shion-timeline-header">
      <span className="shion-page-kicker">PARK SHION / TIMELINE</span>
      <h1 id="shion-timeline-title"><Trans value="활동 타임라인" /></h1>
      <p><Trans value="주요 활동과 날짜별 사진·영상을 한곳에서 살펴보세요" /></p>
    </header>
    <div className="shion-timeline-controls">
      <div className="shion-timeline-tabs" role="group" aria-label={t('자료 분류')}>
        {FILTERS.map((item) => <button type="button" key={item.kind} aria-pressed={kind === item.kind} className={kind === item.kind ? 'is-active' : ''} onClick={() => chooseKind(item.kind)}>{t(item.label)}</button>)}
      </div>
      <label className="shion-timeline-year"><span className="sr-only"><Trans value="연도" /></span><select value={year} onChange={(event) => chooseYear(event.target.value)}><option value="all">{t('전체 연도')}</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <p className="shion-timeline-description"><Trans value="공식 활동은 출처를 명시하고, 사진과 영상은 자료에 기록된 날짜를 기준으로 표시합니다" /></p>
    {data && (data.photoError || data.filmError) ? <div role="status" className="shion-overview-warning"><span><Trans value="일부 목록을 불러오지 못했습니다" /></span><button type="button" onClick={reload}><Trans value="다시 시도" /></button></div> : null}
    {loading ? <div className="shion-timeline-loading" role="status"><Trans value="타임라인을 불러오는 중" /></div> : <>
      <div className="shion-timeline-count">{formatNumber(matches.length)} <Trans value="개 기록" /></div>
      {matches.length ? <ol className="shion-timeline-list">{matches.slice(0, visible).map((item) => <li key={item.key} className={`shion-timeline-entry is-${item.kind}`}>
        <time dateTime={item.date}>{item.date.replace(/-/g, '.')}</time>
        <div className="shion-timeline-entry-body">
          <span className="shion-timeline-kind">{item.kind === 'milestone' ? t('주요 활동') : item.kind === 'photos' ? 'PHOTO' : 'FILM'}</span>
          <h2>{searchLabel(item.title, language)}</h2>
          <p>{searchLabel(item.description, language)}</p>
          {item.entries.length ? <div className="shion-timeline-media">{item.entries.slice(0, item.kind === 'photos' ? 4 : 2).map((entry) => <button key={entry.key} type="button" onClick={() => setScreen(entry.category === 'photos' ? 'photos' : 'film', entry.id)} aria-label={searchLabel(entry.title, language)}>
            {entry.image ? <img src={entry.image} alt="" loading="lazy" decoding="async" /> : <span>{entry.category.toUpperCase()}</span>}
          </button>)}</div> : null}
          {item.entries.length ? <button type="button" className="shion-timeline-open" onClick={() => setScreen(item.kind === 'photos' ? 'photos' : 'film', item.entries[0]?.id)}><Trans value="자료 열기" /><ArrowIcon width={14} height={14}/></button> : null}
          {item.source ? <a href={item.source} target="_blank" rel="noopener noreferrer" className="shion-timeline-open"><Trans value="공식 자료 확인" /><ArrowIcon width={14} height={14}/></a> : null}
        </div>
      </li>)}</ol> : <div className="shion-timeline-empty"><Trans value="선택한 조건에 해당하는 기록이 없습니다" /></div>}
      {visible < matches.length ? <div className="shion-timeline-more"><button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)}><Trans value="더 보기" /> <span>{visible} / {matches.length}</span></button></div> : null}
    </>}
    <div className="shion-timeline-footer">ARCHIVED BY @bbangshion</div>
  </div>;
}
