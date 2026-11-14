export type FilmCategory = 'signal' | 'music' | 'performance' | 'live' | 'other';

export interface Film {
  id: string;
  title: string;
  youtubeId: string;
  category: FilmCategory;
  publishedAt: string | null;
  group: string;
  note: string;
}

const CATEGORY_MAP: Record<string, FilmCategory> = {
  signal: 'signal', sssignal: 'signal', '시그널': 'signal',
  mv: 'music', music: 'music', '뮤직비디오': 'music', 'visual': 'music',
  performance: 'performance', fancam: 'performance', dance: 'performance', '직캠': 'performance',
  live: 'live', '라이브': 'live', other: 'other', reveal: 'other', teaser: 'other',
};

function objectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function videoIdFromUrl(value: unknown): string {
  const input = stringValue(value);
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:') return '';
    if (url.hostname === 'youtu.be') return url.pathname.split('/')[1] ?? '';
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') return url.searchParams.get('v') ?? '';
      if (/^\/(shorts|embed|live)\//.test(url.pathname)) return url.pathname.split('/')[2] ?? '';
    }
  } catch { return ''; }
  return '';
}

function includesS20(row: Record<string, unknown>): boolean {
  const members = row.memberIds ?? row.members ?? row.memberId ?? row.member;
  const list = Array.isArray(members) ? members : [members];
  // Do not claim that an OT24 video features Shion unless its source explicitly tags S20.
  return list.some((item) => {
    const value = stringValue(item).toLowerCase().replace(/[\s_-]/g, '');
    return ['s20', 's20shion', 'shion', 'parkshion', '박시온', '시온'].includes(value);
  });
}

function validDate(value: unknown): string | null {
  const date = stringValue(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date ? null : date;
}

export function normalizeFilms(input: unknown): Film[] {
  const rows = Array.isArray(input) ? input : objectRecord(input) && Array.isArray(input.items) ? input.items : objectRecord(input) && Array.isArray(input.videos) ? input.videos : [];
  const unique = new Map<string, Film>();
  for (const value of rows) {
    if (!objectRecord(value) || !includesS20(value)) continue;
    const youtubeId = videoIdFromUrl(value.youtubeId ?? value.youtubeUrl ?? value.videoUrl ?? value.url);
    if (!/^[\w-]{11}$/.test(youtubeId)) continue;
    const title = stringValue(value.title);
    if (!title || title.length > 180 || unique.has(youtubeId)) continue;
    const rawCategory = stringValue(value.category ?? value.type).toLowerCase();
    unique.set(youtubeId, {
      id: youtubeId,
      title,
      youtubeId,
      category: CATEGORY_MAP[rawCategory] ?? 'other',
      publishedAt: validDate(value.publishedAt ?? value.date),
      group: stringValue(value.group ?? value.dimension).slice(0, 70) || 'tripleS',
      note: stringValue(value.note ?? value.description).slice(0, 220),
    });
  }
  return Array.from(unique.values()).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || a.title.localeCompare(b.title, 'ko'));
}

export const filmThumbnail = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const filmYoutubeUrl = (id: string): string => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
export const filmEmbedUrl = (id: string): string => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`;

export function readableFilmDate(date: string | null): string {
  return date ? date.replace(/-/g, '.') : '날짜 미등록';
}
