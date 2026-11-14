import { ArrowIcon } from './Icons';

/**
 * SHION ARCHIVE · PROFILE 1.5.2
 * Existing Vite / React / Tailwind project: drop-in ProfilePage.tsx replacement.
 * Sources are described in the page footer. Fan-compiled facts are not claimed as official.
 * No new dependencies, images, context values, or routes are required.
 */

const PORTRAIT = `${import.meta.env.BASE_URL}images/shion-home.jpg`;

const facts: ReadonlyArray<{ name: string; value: string; note?: string }> = [
  { name: '이름', value: '박시온 · Park ShiOn' },
  { name: '영어 이름', value: 'Sophie Park', note: '팬 프로필에 수록된 표기' },
  { name: '그룹', value: 'tripleS' },
  { name: '멤버 번호', value: 'S20' },
  { name: '생년월일', value: '2006년 4월 3일' },
  { name: '출생지', value: '대전광역시' },
  { name: '포지션', value: '메인보컬', note: '팬 프로필 및 NXT 활동 소개 기준' },
  { name: '혈액형', value: 'A형' },
  {
    name: 'MBTI',
    value: 'ESFP',
    note: '일본 공식 프로필 기준 · 최근 팬 위키에는 ISFJ로 표기되어 있어 출처에 차이가 있습니다',
  },
  { name: '대표 색상', value: 'French Rose · #FF428A' },
  { name: 'S 공개일', value: '2023년 12월 24일' },
  { name: '유닛 데뷔', value: '2023년 12월 23일 · NXT', note: 'S 공개일과는 구분' },
];

const nicknames: ReadonlyArray<{ name: string; description: string; label?: string }> = [
  { name: '빵시온', description: '빵을 특히 좋아하는 취향에서 비롯된 별명', label: '대표 별명' },
  { name: '쇼니 / 숀', description: '이름을 친근하게 줄여 부르는 애칭' },
  { name: '먹잘알', description: '음식과 맛집에 관심이 많은 모습에서 나온 별명' },
  { name: '애기목소리', description: '가늘고 개성 있는 목소리를 가리키는 별명' },
  { name: '헬륨아씨', description: '높고 맑은 목소리에서 연상된 팬 별명' },
  { name: '참새', description: '정하연이 붙여준 것으로 알려진 별명' },
  { name: '인간 논스케일', description: '〈Non Scale〉과 잘 어울리는 음색에서 나온 팬 별명' },
  { name: '빨간 머리 숀', description: '빨간 머리 스타일링을 계기로 쓰인 별명' },
  { name: '오이시온', description: '일본 매체 인터뷰에서 직접 소개한 애칭', label: '인터뷰' },
];

const interests: ReadonlyArray<{ title: string; items: readonly string[]; description?: string }> = [
  {
    title: '취미',
    items: ['피아노', '산책', '독서', '드라마·영화 감상', '사진 촬영', '맛집 탐방', '운동'],
    description: '본인 소개 자료와 인터뷰에서 언급한 관심사',
  },
  {
    title: '좋아하는 음식',
    items: ['빵', '크림빵', '스콘', '케이크', '떡볶이', '햄버거', '찜닭', '국밥', '치킨'],
    description: '특히 빵과 디저트에 관심이 많은 것으로 알려져 있어요',
  },
  {
    title: '좋아하는 음악',
    items: ['Generation · Acid Angel from Asia', '미열 37.5 · EVOLution'],
    description: '좋아하는 tripleS 곡으로 소개한 노래',
  },
  {
    title: '좋아하는 작품과 캐릭터',
    items: ['캐릭캐릭 체인지', '꿈빛 파티시엘', '뽀로로의 패티', '짱구는 못말려', '해리 포터'],
    description: '캐릭터 취향은 팬 프로필, 영화 취향은 인터뷰 참고',
  },
  {
    title: '계절과 패션',
    items: ['봄', '스포티·캐주얼', '개성 있는 코디', '페미닌 스타일', '겨울 옷'],
    description: '일본 패션 매체 인터뷰에서 공개한 취향 포함',
  },
];

const talents: ReadonlyArray<{ title: string; detail: string }> = [
  { title: '사진과 영상', detail: '촬영과 편집을 잘한다고 소개한 분야' },
  { title: '꾸미기', detail: '사진 꾸미기와 장식을 좋아하는 것으로 알려져 있어요' },
  { title: '목소리 흉내', detail: '인물의 말투와 목소리를 따라 하는 성대모사' },
  { title: '맛집 찾기', detail: '음식과 식당에 대한 관심을 살린 특기' },
  { title: '운동과 산책', detail: '운동, 산책, 등산을 즐긴다고 직접 소개했어요' },
];

const dimensions: ReadonlyArray<{ name: string; time: string; description: string; status?: string }> = [
  { name: 'NXT', time: '2023', description: '린 · 주빈 · 정하연 · 박시온 · 〈Just Do It〉', status: '데뷔 유닛' },
  { name: '∞! (Hatchi)', time: '2024', description: '일본 활동 디멘션 · 〈Untitled〉' },
  { name: 'Alphie (@%)', time: '2025', description: '투어를 위해 구성된 프로젝트 유닛' },
  { name: 'Moon', time: '2025', description: 'msnz 디멘션 · 〈Cameo Love〉' },
  { name: 'Aura', time: '2026', description: '발라드 디멘션 2 · 멤버 선정', status: '선정' },
];

const links: ReadonlyArray<{ title: string; type: string; href: string; context: string }> = [
  {
    title: 'tripleS 일본 공식 프로필', type: '공식',
    href: 'https://www.triples-official.jp/profile/',
    context: '생년월일 · 혈액형 · 일본 공식 사이트의 MBTI',
  },
  {
    title: 'Droptokyo · ShiOn 인터뷰', type: '본인 인터뷰',
    href: 'https://droptokyo.com/wedrop/334219/',
    context: '애칭 · 취미 · 패션 · 좋아하는 작품',
  },
  {
    title: 'tripleS Wiki · Park ShiOn Facts', type: '팬 아카이브',
    href: 'https://triples.fandom.com/wiki/Park_ShiOn/Facts',
    context: '취미 · 음식 · 특기 · 캐릭터',
  },
  {
    title: '박시온 · 나무위키', type: '팬 위키',
    href: 'https://namu.wiki/w/%EB%B0%95%EC%8B%9C%EC%98%A8',
    context: '별명 · 취향 · 활동 이력 · 최근 MBTI 표기',
  },
  {
    title: 'tripleS Fans · ShiOn', type: '팬 아카이브',
    href: 'https://triplesfans.com/members/shion',
    context: 'NXT · ∞! · Moon · 활동 개요',
  },
];

function Heading({ kicker, title, id, description }: { kicker: string; title: string; id: string; description?: string }) {
  return (
    <div className="mb-6 sm:mb-8">
      <span className="mb-3 block text-[10px] font-semibold tracking-[.17em] text-[#cbb4c3]">{kicker}</span>
      <h2 id={id} className="text-[clamp(25px,4vw,37px)] font-medium tracking-[-.055em] text-paper">{title}</h2>
      {description && <p className="mt-3 max-w-2xl text-[12px] leading-7 text-ash">{description}</p>}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return <span className="inline-flex items-center rounded-sm border border-white/[.13] bg-white/[.035] px-3 py-2 text-[12px] text-[#e2dce2]">{label}</span>;
}

export function ProfilePage() {
  return (
    <section className="shion-profile animate-appear pb-10" aria-labelledby="profile-heading">
      <header className="shion-page-heading">
        <span className="shion-page-kicker">S20 / PROFILE</span>
        <h1 id="profile-heading">박시온</h1>
        <p>tripleS · Park ShiOn</p>
      </header>

      <nav aria-label="프로필 목차" className="mb-9 -mx-1 flex gap-2 overflow-x-auto px-1 pb-3 sm:mb-12">
        {([
          ['basic', '기본 정보'],
          ['nicknames', '별명'],
          ['interests', '취미와 취향'],
          ['talents', '특기'],
          ['dimensions', '활동'],
          ['references', '출처'],
        ] as const).map(([id, label]) => (
          <a key={id} href={`#profile-${id}`} className="shrink-0 rounded-sm border border-white/[.13] bg-white/[.025] px-4 py-2.5 text-[12px] text-[#ccc3cd] transition-colors duration-[250ms] ease-plush hover:border-blush/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush">
            {label}
          </a>
        ))}
      </nav>

      <div id="profile-basic" className="shion-profile-intro scroll-mt-28">
        <figure className="shion-profile-portrait">
          <img src={PORTRAIT} alt="공항에서 촬영한 박시온" width="1152" height="1536" loading="eager" decoding="async" />
          <figcaption>Park ShiOn · S20</figcaption>
        </figure>
        <div className="shion-profile-info">
          <span className="shion-page-kicker">PARK SHION / TRIPLES</span>
          <h2>Park ShiOn</h2>
          <p className="shion-profile-sub">2023년 공개된 tripleS의 스무 번째 멤버. NXT로 활동을 시작해 ∞!, Moon 등 여러 디멘션에 참여하고 있습니다.</p>
          <div className="mb-8 flex flex-wrap gap-2" aria-label="대표 키워드">
            <Tag label="S20" />
            <Tag label="메인보컬" />
            <Tag label="🍞 빵시온" />
            <Tag label="French Rose" />
          </div>
          <dl className="shion-fact-grid">
            {facts.map((fact) => (
              <div key={fact.name}>
                <dt>{fact.name}</dt>
                <dd>{fact.value}{fact.note && <small>{fact.note}</small>}</dd>
              </div>
            ))}
          </dl>
          <a className="shion-official-link" href="https://www.triples-official.jp/profile/" target="_blank" rel="noopener noreferrer">
            공식 프로필 보기 <ArrowIcon width={16} height={16} />
          </a>
        </div>
      </div>

      <section id="profile-nicknames" aria-labelledby="profile-nicknames-heading" className="mt-20 scroll-mt-28 sm:mt-28">
        <Heading kicker="NICKNAMES" title="별명" id="profile-nicknames-heading" description="팬 커뮤니티와 인터뷰에서 사용된 애칭을 정리했습니다. 일부는 팬들이 붙인 별명입니다." />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nicknames.map((item) => (
            <article key={item.name} className="min-w-0 rounded-sm border border-white/[.1] bg-[#17161b] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[18px] font-medium tracking-[-.04em] text-paper">{item.name}</h3>
                {item.label && <span className="shrink-0 border-b border-[#e4abc7]/50 pb-1 text-[10px] text-[#dfb8d0]">{item.label}</span>}
              </div>
              <p className="mt-4 text-[12px] leading-[1.9] text-[#b4acb5]">{item.description}</p>
            </article>
          ))}
        </div>
        <p className="mt-5 text-[11px] leading-6 text-ash">시온이 팬들을 부르는 이름으로는 ‘밥온단’이 알려져 있습니다.</p>
      </section>

      <section id="profile-interests" aria-labelledby="profile-interests-heading" className="mt-20 scroll-mt-28 sm:mt-28">
        <Heading kicker="INTERESTS" title="취미와 취향" id="profile-interests-heading" description="음식, 음악, 작품, 일상까지 조금 더 자세히 살펴보는 시온의 취향" />
        <div className="grid gap-3 md:grid-cols-2">
          {interests.map((item) => (
            <article key={item.title} className="min-w-0 rounded-sm border border-white/[.1] bg-white/[.025] p-5 sm:p-7">
              <h3 className="text-[17px] font-medium tracking-[-.03em] text-paper">{item.title}</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.items.map((value) => <Tag key={value} label={value} />)}
              </div>
              {item.description && <p className="mt-5 text-[11px] leading-6 text-ash">{item.description}</p>}
            </article>
          ))}
        </div>
      </section>

      <section id="profile-talents" aria-labelledby="profile-talents-heading" className="mt-20 scroll-mt-28 sm:mt-28">
        <Heading kicker="SKILLS" title="특기와 관심사" id="profile-talents-heading" description="본인 소개와 인터뷰에 나온 내용 중심으로 정리했습니다." />
        <div className="border-t border-white/[.14]">
          {talents.map((item, index) => (
            <article key={item.title} className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 border-b border-white/[.12] py-5 sm:grid-cols-[56px_190px_minmax(0,1fr)] sm:items-center sm:gap-5 sm:py-6">
              <span className="pt-1 text-[11px] tabular-nums text-ash sm:pt-0">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-[15px] font-medium text-paper sm:text-[17px]">{item.title}</h3>
              <p className="col-start-2 text-[12px] leading-6 text-ash sm:col-start-3">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="profile-dimensions" className="shion-profile-units scroll-mt-28" aria-labelledby="profile-dimensions-heading">
        <Heading kicker="DIMENSIONS" title="활동 유닛" id="profile-dimensions-heading" description="확정된 활동과 멤버 선정 이력을 구분해서 표시했습니다." />
        <div className="shion-unit-list">
          {dimensions.map((unit) => (
            <article key={unit.name} className="shion-unit-row">
              <span>{unit.time}</span>
              <div>
                <h3 className="flex flex-wrap items-center gap-3">{unit.name}{unit.status && <span className="text-[10px] font-normal tracking-normal text-[#d8b6c8]">{unit.status}</span>}</h3>
                <p>{unit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="profile-references" aria-labelledby="profile-references-heading" className="mt-20 scroll-mt-28 sm:mt-28">
        <Heading kicker="SOURCES" title="정보 출처" id="profile-references-heading" description="공식 자료와 본인 인터뷰를 우선으로 확인하고, 별명과 일부 취향은 팬 위키를 참고했습니다." />
        <div className="divide-y divide-white/[.09] border-y border-white/[.14]">
          {links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 items-center justify-between gap-4 py-5 text-left transition-colors duration-[250ms] ease-plush hover:text-blush focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush">
              <span className="min-w-0">
                <span className="mb-2 block text-[10px] tracking-[.04em] text-ash">{link.type}</span>
                <span className="block text-[13px] font-medium text-paper group-hover:text-blush">{link.title}</span>
                <span className="mt-2 block text-[11px] leading-5 text-ash">{link.context}</span>
              </span>
              <ArrowIcon width={17} height={17} />
            </a>
          ))}
        </div>
        <p className="shion-source-note">2026년 11월 14일 기준으로 참고한 자료입니다. MBTI와 활동 정보처럼 변동될 수 있는 항목은 출처에 따라 다르게 표기될 수 있습니다. 이 페이지는 비공식 팬 아카이브입니다.</p>
      </section>
    </section>
  );
}
