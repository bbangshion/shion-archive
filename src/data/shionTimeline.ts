export const activityKinds = ['공개·데뷔','음반·유닛','방송·콘텐츠','공연·행사','SIGNAL','기타'] as const;
export type ActivityKind = typeof activityKinds[number];
export type EvidenceStatus = '확인' | '추가 검토';
export type Activity = {
  id: string;
  date: string; // YYYY-MM-DD, actual event/publication date
  title: string;
  kind: ActivityKind;
  summary: string;
  source?: string;
  relatedUrl?: string;
  status: EvidenceStatus;
  tags?: string[];
};

// Only source-backed records belong in '확인'. Never add a group event unless S20 participated.
// '추가 검토' records stay hidden until the "검토 중 포함" option is activated.
export const shionActivities: Activity[] = [
  {id:'2023-nxt-song',date:'2023-12-23',title:'NXT — Just Do It 발매',kind:'음반·유닛',summary:'린·주빈·하연·시온이 참여한 NXT의 첫 음원.',source:'https://www.etnews.com/20231225000010',status:'확인',tags:['NXT','음원']},
  {id:'2023-s20-reveal',date:'2023-12-24',title:'S20 박시온 공개',kind:'공개·데뷔',summary:'tripleS 공식 SNS를 통해 S20 박시온이 공개되었다.',source:'https://www.etnews.com/20231225000010',status:'확인',tags:['S20','프로필']},
  {id:'2023-shion-teaser',date:'2023-12-29',title:'박시온 개인 티저 공개',kind:'방송·콘텐츠',summary:'NXT 시온의 개인 티저 영상이 공식 채널에 공개되었다.',source:'https://www.etnews.com/20231230000010',status:'확인',tags:['NXT','티저']},
  {id:'2023-nxt-performance',date:'2023-12-30',title:'NXT — Just Do It 퍼포먼스 영상',kind:'방송·콘텐츠',summary:'NXT 퍼포먼스 영상 공개.',source:'https://www.etnews.com/20231230000010',status:'확인',tags:['NXT','퍼포먼스']},
  {id:'2024-assemble24',date:'2024-05-08',title:'ASSEMBLE24 — Girls Never Die',kind:'음반·유닛',summary:'24인 완전체 정규 앨범 활동.',source:'https://triplesfans.com/members/shion',status:'확인',tags:['ASSEMBLE24','완전체']},
  {id:'2024-japan-gravity',date:'2024-07-20',title:'일본 디멘션 결성 GRAVITY',kind:'음반·유닛',summary:'박시온과 마유가 사전 선정된 일본 디멘션 구성.',source:'https://triplesfans.com/members/shion',status:'확인',tags:['Hatchi','GRAVITY']},
  {id:'2024-hatchi-debut',date:'2024-11-20',title:'∞! (Hatchi) 일본 데뷔',kind:'음반·유닛',summary:'일본 디멘션 ∞!의 데뷔 활동. 발매일과 행사일은 구분해 관리.',source:'https://triplesfans.com/members/shion',status:'확인',tags:['Hatchi','일본']},
  {id:'2025-assemble25',date:'2025-05-12',title:'ASSEMBLE25 — 깨어 (Are You Alive)',kind:'음반·유닛',summary:'tripleS 완전체 앨범 활동.',source:'https://triplesfans.com/members/shion',status:'확인',tags:['ASSEMBLE25','완전체']},
  {id:'2025-moon',date:'2025-11-24',title:'moon — Beyond Beauty',kind:'음반·유닛',summary:'박시온이 참여한 moon 디멘션 앨범 활동.',source:'https://triples.fandom.com/wiki/Park_ShiOn',status:'확인',tags:['moon','msnz']},
  {id:'2026-assemble26',date:'2026-06-01',title:'ASSEMBLE26 <LOVE&POP> pt.1',kind:'음반·유닛',summary:'Baby Flower를 포함한 완전체 활동.',source:'https://triplesfans.com/members/shion',status:'확인',tags:['ASSEMBLE26','완전체']},
  {id:'2026-ballad-lineup',date:'2026-08-23',title:'Ballad Dimension 2 멤버 선정',kind:'음반·유닛',summary:'박시온이 참여한 두 번째 발라드 디멘션 라인업 공개.',source:'https://triplesfans.com/members/shion',status:'확인',tags:['발라드','GRAVITY']},
  {id:'2026-tma',date:'2026-09-19',title:'2026 THE FACT MUSIC AWARDS',kind:'공연·행사',summary:'박시온이 포함된 12인 행사 라인업.',source:'https://triplesfans.com/members/shion',status:'확인',tags:['시상식','공연']},
];

export const validDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0,10) === v;
export function normalizeTimeline(rows: readonly Activity[]): Activity[] {
  const ids = new Set<string>();
  return rows.filter(row => {
    if (!row || !row.id || ids.has(row.id) || !validDate(row.date) || !row.title?.trim() || !activityKinds.includes(row.kind)) return false;
    ids.add(row.id);
    return true;
  }).sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
export function filterTimeline(rows: readonly Activity[], opts: {year: string; kind: string; query: string; includeReview: boolean}): Activity[] {
  const q = opts.query.trim().normalize('NFKC').toLocaleLowerCase();
  return normalizeTimeline(rows).filter(row =>
    (opts.includeReview || row.status === '확인') &&
    (opts.year === '전체' || row.date.startsWith(opts.year + '-')) &&
    (opts.kind === '전체' || row.kind === opts.kind) &&
    (!q || [row.title,row.summary,row.kind,...(row.tags||[])].join(' ').normalize('NFKC').toLocaleLowerCase().includes(q))
  );
}
