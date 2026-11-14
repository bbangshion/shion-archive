import { Trans, useI18n } from '../i18n/I18nContext';
import { ArrowIcon } from './Icons';
/**
 * SHION ARCHIVE · PROFILE 1.5.3
 * Standalone ProfilePage replacement, compatible with the existing 1.5.x route.
 * Factual details are separated by provenance below; fan catalogues are not official statements.
 * Verified/cross-checked against listed resources on 2026-11-14.
 */
const PORTRAIT = `${import.meta.env.BASE_URL}images/shion-home.jpg`;
type SourceKind = '공식' | '본인 인터뷰' | '공식 발표 인용' | '공연 기록' | '팬 자료';
type Fact = {
    label: string;
    value: string;
    note?: string;
};
type Unit = {
    name: string;
    subtitle: string;
    period: string;
    badge: string;
    members: readonly string[];
    songs: readonly string[];
    description: string;
    history: readonly string[];
    sourceText: string;
    sourceUrl: string;
    recent?: boolean;
};
const facts: readonly Fact[] = [
    { label: '이름', value: '박시온 · Park ShiOn' },
    { label: '영어 이름', value: 'Sophie Park', note: '팬 프로필 표기' },
    { label: '그룹', value: 'tripleS' },
    { label: '멤버 번호', value: 'S20 · Cream01' },
    { label: '생년월일', value: '2006년 4월 3일' },
    { label: '출생', value: '대전광역시 유성구', note: '팬 자료 기준' },
    { label: '혈액형', value: 'A형' },
    { label: 'MBTI', value: 'ESFP', note: '일본 공식 프로필 표기 · 일부 팬 자료에서는 ISFJ로 소개' },
    { label: '포지션', value: 'NXT 메인보컬', note: 'NXT 활동 당시 언론 및 팬 자료 기준' },
    { label: '대표 색상', value: 'French Rose · #FF428A', note: '팬 데이터 표기' },
    { label: 'S 공개', value: '2023년 12월 24일' },
    { label: '첫 유닛 음원', value: 'NXT · Just Do It (2023년 12월 23일)' },
];
const nicknameList: readonly {
    name: string;
    text: string;
    origin: string;
}[] = [
    { name: '오이시온', text: '일본어의 ‘맛있다(おいしい)’와 시온을 합친 애칭', origin: '본인 인터뷰' },
    { name: '빵시온', text: '빵과 디저트를 좋아하는 취향에서 알려진 애칭', origin: '팬 사용' },
    { name: '쇼니 · 숀', text: '시온의 이름을 줄여 부르는 친근한 호칭', origin: '팬 사용' },
    { name: '애기 목소리', text: '음색과 말투의 특징을 표현하는 별명', origin: '팬 프로필' },
    { name: '먹잘알', text: '맛집을 찾고 음식 이야기를 즐기는 취향을 나타내는 표현', origin: '팬 프로필' },
];
const interestGroups: readonly {
    title: string;
    description: string;
    items: readonly string[];
    source: string;
}[] = [
    {
        title: '취미',
        description: '일상에서 즐기는 활동',
        items: ['피아노', '사진 촬영', '맛집 찾기', '산책', '운동', '독서', '드라마 감상', '영화 감상'],
        source: '본인 인터뷰 · 멤버 소개',
    },
    {
        title: '음식',
        description: '빵과 디저트를 포함해 즐겨 먹는 음식',
        items: ['크림빵', '스콘', '쿠키', '아이스크림', '떡볶이', '햄버거', '국밥', '찜닭', '치킨', '피자'],
        source: '멤버 소개',
    },
    {
        title: '좋아하는 tripleS 노래',
        description: '멤버 프로필에서 직접 언급한 선호곡',
        items: ['Generation — Acid Angel from Asia', '37.5°C — EVOLution'],
        source: '팬 정리 자료',
    },
    {
        title: '좋아하는 작품과 캐릭터',
        description: '본인 인터뷰와 공개 소개 자료 기준',
        items: ['해리 포터', '나의 소녀시대', '도깨비', '캐릭캐릭 체인지', '꿈빛 파티시엘', '짱구는 못말려', '뽀로로의 패티'],
        source: '본인 인터뷰 · 팬 정리 자료',
    },
    {
        title: '패션',
        description: '일본 패션 매체에서 밝힌 취향',
        items: ['스포티', '캐주얼', '개성 있는 코디', '페미닌 스타일', '겨울 옷', 'NIKE', 'Matin Kim', 'THE NORTH FACE'],
        source: 'Droptokyo 인터뷰',
    },
];
const units: readonly Unit[] = [
    {
        name: 'Aura', subtitle: '아우라 · 두 번째 발라드 디멘션', period: '2026',
        badge: '최신 유닛', recent: true,
        members: ['S1 윤서연', 'S18 주빈', 'S20 박시온', 'S23 서아'],
        songs: ['Dream Drip — ANDLESS 공연에서 선공개'],
        description: 'Aria에 이은 tripleS의 두 번째 발라드 디멘션. 2026년 8월 Grand Gravity에서 주빈을 제외한 세 멤버가 WAV 투표로 선정됐습니다.',
        history: [
            '2026.08.20–23 · COSMO Grand Gravity 진행',
            '2026.08.23 · 최종 멤버 윤서연·주빈·박시온·서아 확정',
            '2026.10.10–11 · ANDLESS 서울 공연에서 Aura와 Dream Drip 무대 공개',
            '정식 음원 발매일과 공연 공개일은 구분해 기록',
        ],
        sourceText: '모드하우스 발표 인용 보도',
        sourceUrl: 'https://www.swtvnews.com/news/newsview.php?ncode=1065566054605581',
    },
    {
        name: 'Moon', subtitle: '문 · msnz 디멘션', period: '2025–', badge: 'msnz',
        members: ['S9 카에데', 'S14 박소현', 'S17 린', 'S20 박시온', 'S22 설린', 'S24 지연'],
        songs: ['Cameo Love — Beyond Beauty', 'Dream Dress — 일본 오리지널 곡'],
        description: 'msnz의 네 디멘션 중 하나로, 설린을 중심으로 구성된 6인조 유닛입니다. Beyond Beauty 수록곡 Cameo Love와 일본 오리지널 곡 Dream Dress에 참여했습니다.',
        history: [
            '2025.11.24 · msnz Beyond Beauty 발표',
            'Moon의 곡 Cameo Love 활동',
            '2026.08.01 · 일본 디지털 곡 Dream Dress 공개',
        ],
        sourceText: 'tripleS 팬 아카이브 · Moon 활동',
        sourceUrl: 'https://triplesfans.com/members/shion',
    },
    {
        name: 'Alphie', subtitle: '알피(@%) · 투어 프로젝트 유닛', period: '2025', badge: '투어',
        members: ['S5 김유연', 'S11 코토네', 'S13 니엔', 'S17 린', 'S19 정하연', 'S20 박시온', 'S21 김채원', 'S24 지연'],
        songs: ['Lit Pop — 투어 공개곡'],
        description: '2025년 Alpha Percent 월드투어를 위해 결성된 8인조 프로젝트 유닛입니다. 북미 투어와 영어 곡 Lit Pop으로 활동했습니다.',
        history: [
            '2025.07 · 8인조 투어 유닛 발표',
            '2025.09.03 · Alpha Percent 북미 투어 시작',
            '투어 기간 Lit Pop 무대 진행',
        ],
        sourceText: 'Alpha Percent 공식 공연장 소개',
        sourceUrl: 'https://www.palaceoffinearts.org/event/triples-alphie-world-tour/',
    },
    {
        name: '∞! (Hatchi)', subtitle: '하치 · 일본 활동 디멘션', period: '2024–', badge: '일본 활동',
        members: ['S3 이지우', 'S4 김채연', 'S5 김유연', 'S6 김수민', 'S11 코토네', 'S16 마유', 'S20 박시온', 'S21 김채원'],
        songs: ['Untitled — 2024', 'Password — 2025'],
        description: '일본 활동을 위한 8인조 디멘션. 박시온과 마유가 사전 선발됐으며, 나머지 멤버는 Gravity로 결정됐습니다. 구성 멤버가 바뀔 수 있는 로테이션 유닛입니다.',
        history: [
            '2024.07 · 박시온과 마유 사전 선정, 나머지 멤버 Gravity 결정',
            '2024.11.20 · 일본 데뷔 싱글 Untitled',
            '2025.10.01 · SecretHimitsuBimil / Password 활동',
        ],
        sourceText: 'tripleS 팬 아카이브 · 하치 활동',
        sourceUrl: 'https://triplesfans.com/members/shion',
    },
    {
        name: 'NXT', subtitle: '넥스트 · 첫 활동 유닛', period: '2023', badge: '출발점',
        members: ['S17 린', 'S18 주빈', 'S19 정하연', 'S20 박시온'],
        songs: ['Just Do It — 2023'],
        description: '2023년 12월 연이어 공개된 네 멤버로 구성된 디멘션. 박시온이 처음 참여한 유닛으로, Just Do It을 발표하며 활동을 시작했습니다.',
        history: [
            '2023.12.23 · NXT Just Do It 공개',
            '2023.12.24 · 박시온 S20 개인 공개',
            '팬 투표로 결성된 유닛이 아닌 사전 구성 유닛',
        ],
        sourceText: 'tripleS 공식 음반 목록 · 팬 아카이브',
        sourceUrl: 'https://www.triples-official.jp/discography/',
    },
];
const highlights: readonly {
    date: string;
    title: string;
    detail: string;
}[] = [
    { date: '2023.12', title: 'NXT · Just Do It', detail: 'NXT의 4인조 구성으로 활동을 시작했고, 12월 24일 S20으로 공개됐습니다.' },
    { date: '2024.05', title: 'ASSEMBLE24', detail: '24인 완전체의 Girls Never Die 활동에 참여했습니다.' },
    { date: '2024.11', title: '∞! 일본 데뷔', detail: '하치의 Untitled 활동으로 일본 디멘션의 무대에 섰습니다.' },
    { date: '2025.05', title: 'ASSEMBLE25', detail: '완전체의 Are You Alive 활동에 참여했습니다.' },
    { date: '2025.09', title: 'Alphie 월드투어', detail: 'Alpha Percent 투어의 프로젝트 유닛으로 북미 무대에 올랐습니다.' },
    { date: '2025.11', title: 'Moon · Cameo Love', detail: 'msnz의 Moon 멤버로 Beyond Beauty 활동에 참여했습니다.' },
    { date: '2026.06', title: 'ASSEMBLE26 · Baby Flower', detail: '완전체 LOVE&POP pt.1의 Baby Flower 활동에 참여했습니다.' },
    { date: '2026.08', title: 'Aura 멤버 확정', detail: '두 번째 발라드 디멘션에 WAV 투표로 합류했습니다.' },
    { date: '2026.10', title: 'Aura · Dream Drip', detail: 'ANDLESS 서울 공연에서 Dream Drip 무대가 공개됐습니다.' },
];
const voiceNotes: readonly {
    name: string;
    detail: string;
}[] = [
    { name: 'NXT에서 시작한 보컬', detail: 'NXT의 메인보컬로 소개됐으며, Just Do It을 통해 처음 음악 활동을 알렸습니다.' },
    { name: '서로 다른 음악의 유닛', detail: '일본 활동의 하치, msnz의 Moon, 발라드 중심의 Aura까지 다양한 편성에 참여했습니다.' },
    { name: '팬들이 기억하는 음색', detail: '높고 맑은 목소리의 개성을 표현하는 애칭이 알려져 있습니다. 음색에 대한 평가는 팬들의 감상일 수 있습니다.' },
];
const interview: readonly {
    title: string;
    description: string;
}[] = [
    { title: '휴식 방법', description: '아무것도 하지 않고 쉬거나, 산책·운동·등산을 하거나, 빵을 사러 나가며 기분을 전환한다고 밝혔습니다.' },
    { title: '여행', description: '가족이나 친구와 국내 여행을 떠나고, 새로운 지역의 음식점과 문화를 경험해 보고 싶다고 답했습니다.' },
    { title: '일본에서 하고 싶은 일', description: '도쿄타워, 편의점, 동네 식당, 빵집을 찾아가고 멤버들과 디즈니랜드에 가 보고 싶다고 했습니다.' },
    { title: '존경하는 아티스트', description: 'IU를 존경하는 선배 아티스트로 꼽으며 꾸준히 최선을 다하는 태도를 이유로 들었습니다.' },
    { title: '마음가짐', description: '항상 기뻐하고 모든 일에 감사하는 것을 좌우명으로 소개했습니다.' },
    { title: '활동 목표', description: '연습과 고민을 거쳐 좋은 모습을 보여 주고, 계속 성장하고 싶다고 전했습니다.' },
];
const sources: readonly {
    label: string;
    kind: SourceKind;
    detail: string;
    href: string;
}[] = [
    { label: 'tripleS 일본 공식 프로필', kind: '공식', detail: '생년월일 · 혈액형 · 공식 페이지의 MBTI', href: 'https://www.triples-official.jp/profile/' },
    { label: 'Droptokyo · ShiOn 인터뷰', kind: '본인 인터뷰', detail: '애칭 · 옷 · 취미 · 여행 · 존경하는 아티스트', href: 'https://droptokyo.com/wedrop/334219/' },
    { label: '모드하우스 발표 인용 보도', kind: '공식 발표 인용', detail: 'Aura 최종 멤버 · Gravity 선정 방식', href: 'https://www.swtvnews.com/news/newsview.php?ncode=1065566054605581' },
    { label: '2026 ANDLESS 서울 공연 세트리스트', kind: '공연 기록', detail: 'Aura의 Dream Drip 무대 기록', href: 'https://www.setlist.fm/setlist/triples/2026/jangchung-arena-seoul-south-korea-1b738554.html' },
    { label: 'Alphie · 공식 공연장 소개', kind: '공식', detail: 'Alpha Percent 투어 유닛 8인 구성', href: 'https://www.palaceoffinearts.org/event/triples-alphie-world-tour/' },
    { label: 'tripleS 공식 음반 목록', kind: '공식', detail: 'NXT 및 주요 음반', href: 'https://www.triples-official.jp/discography/' },
    { label: 'tripleS Wiki · ShiOn Facts', kind: '팬 자료', detail: '별명 · 음식 · 취미 · 특기', href: 'https://triples.fandom.com/wiki/Park_ShiOn/Facts' },
    { label: 'tripleS Fans · ShiOn', kind: '팬 자료', detail: 'S20 공개 · 디멘션 · 멤버 활동 이력', href: 'https://triplesfans.com/members/shion' },
];
function SectionHeading({ id, english, title, description }: {
    id: string;
    english: string;
    title: string;
    description?: string;
}) {
    return <div className="mb-6 sm:mb-9">
    <span className="mb-2 block text-[10px] font-medium tracking-[.13em] text-[#cab2c2]"><Trans value={english}/></span>
    <h2 id={id} className="text-[clamp(26px,4vw,37px)] font-medium tracking-[-.055em] text-paper"><Trans value={title}/></h2>
    {description && <p className="mt-2 max-w-3xl text-[12px] leading-7 text-ash"><Trans value={description}/></p>}
  </div>;
}
function Pill({ children }: {
    children: string;
}) {
    return <span className="inline-flex min-h-8 items-center rounded-sm border border-white/[.13] bg-white/[.025] px-3 py-1.5 text-[11px] leading-5 text-[#dfd9e0]"><Trans value={children}/></span>;
}
export function ProfilePage() {
    const { t } = useI18n();
    return <section className="shion-profile animate-appear pb-12" aria-labelledby="profile-heading">
    <header className="shion-page-heading">
      <span className="shion-page-kicker">S20 / PROFILE</span>
      <h1 id="profile-heading"><Trans value="박시온"/></h1>
      <p>tripleS · Park ShiOn</p>
    </header>

    <nav aria-label={t("프로필 목차")} className="-mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-3 sm:mb-12">
      {([
            ['basic', '소개'], ['units', '유닛'], ['history', '활동 기록'], ['voice', '보컬'],
            ['nicknames', '별명'], ['interests', '취향'], ['interview', '인터뷰'], ['references', '출처'],
        ] as const).map(([id, text]) => <a key={id} href={`#profile-${id}`} onClick={(event) => { event.preventDefault(); document.getElementById(`profile-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="shrink-0 rounded-sm border border-white/[.12] bg-white/[.025] px-3.5 py-2.5 text-[12px] text-[#cfc6cf] transition-colors duration-[250ms] hover:border-[#d6b4c8] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d6b4c8]">
        <Trans value={text}/>
      </a>)}
    </nav>

    <div id="profile-basic" className="shion-profile-intro scroll-mt-28">
      <figure className="shion-profile-portrait">
        <img src={PORTRAIT} alt={t("박시온 메인 프로필 사진")} width="1152" height="1536" loading="eager" decoding="async"/>
        <figcaption>Park ShiOn · S20</figcaption>
      </figure>
      <div className="shion-profile-info">
        <span className="shion-page-kicker">TRIPLES / S20</span>
        <h2>Park ShiOn</h2>
        <p className="shion-profile-sub"><Trans value="tripleS의 스무 번째 멤버. 2023년 NXT로 활동을 시작했으며 일본 디멘션 ∞!, Alphie, Moon을 거쳐 2026년 발라드 디멘션 Aura의 멤버로 선정됐습니다."/></p>
        <div className="mb-8 flex flex-wrap gap-2">
          {['S20', 'NXT', '∞!', 'Moon', 'Aura'].map(label => <Pill key={label}>{label}</Pill>)}
        </div>
        <dl className="shion-fact-grid">
          {facts.map(item => <div key={item.label}><dt><Trans value={item.label}/></dt><dd><Trans value={item.value}/>{item.note && <small><Trans value={item.note}/></small>}</dd></div>)}
        </dl>
        <a className="shion-official-link" href="https://www.triples-official.jp/profile/" target="_blank" rel="noopener noreferrer"><Trans value="&#xA;          공식 프로필 "/><ArrowIcon width={16} height={16}/>
        </a>
      </div>
    </div>

    <section id="profile-units" className="mt-20 scroll-mt-28 sm:mt-28" aria-labelledby="profile-units-heading">
      <SectionHeading id="profile-units-heading" english="DIMENSIONS" title="활동 유닛" description="NXT부터 Aura까지. 유닛을 누르면 멤버 구성과 활동 기록을 확인할 수 있습니다."/>
      <div className="divide-y divide-white/[.12] border-y border-white/[.13]">
        {units.map(unit => <details key={unit.name} open={unit.recent ? true : undefined} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 py-5 outline-none transition-colors duration-[250ms] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d6b4c8] sm:gap-5 sm:py-7 [&::-webkit-details-marker]:hidden">
            <span className="w-12 shrink-0 text-[11px] tabular-nums text-ash sm:w-16">{unit.period}</span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[20px] font-medium tracking-[-.035em] text-paper sm:text-[26px]">{unit.name}</span>
                <span className="border border-[#bd93ae]/40 px-2 py-1 text-[10px] text-[#dab8cd]"><Trans value={unit.badge}/></span>
              </span>
              <span className="mt-1 block text-[11px] leading-5 text-ash"><Trans value={unit.subtitle}/></span>
            </span>
            <span aria-hidden="true" className="text-[22px] font-light text-[#c5b3c1] group-open:rotate-45 transition-transform duration-[250ms]">+</span>
          </summary>
          <div className="pb-7 pl-0 sm:pb-9 sm:pl-20">
            <p className="max-w-3xl text-[13px] leading-[1.95] text-[#cbc3cd]"><Trans value={unit.description}/></p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-3 text-[11px] font-medium tracking-[.08em] text-[#cdb8c7]">MEMBERS · {unit.members.length}</h4>
                <div className="flex flex-wrap gap-2">{unit.members.map(name => <Pill key={name}>{name}</Pill>)}</div>
              </div>
              <div>
                <h4 className="mb-3 text-[11px] font-medium tracking-[.08em] text-[#cdb8c7]">MUSIC</h4>
                <div className="space-y-2">{unit.songs.map(song => <p key={song} className="text-[12px] leading-6 text-[#d8d0da]"><Trans value={song}/></p>)}</div>
              </div>
            </div>
            <ol className="mt-6 space-y-3 border-l border-white/[.16] pl-4">
              {unit.history.map(event => <li key={event} className="text-[12px] leading-6 text-ash"><Trans value={event}/></li>)}
            </ol>
            <a href={unit.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-[11px] text-[#dcbace] underline decoration-white/25 underline-offset-4 hover:text-white"><Trans value="&#xA;              자료 보기 · "/><Trans value={unit.sourceText}/> <ArrowIcon width={13} height={13}/>
            </a>
          </div>
        </details>)}
      </div>
      <p className="mt-4 text-[11px] leading-6 text-ash"><Trans value="Alphie는 투어 프로젝트 유닛입니다. Aura의 음악은 공연 공개와 음원 발매를 구분해 기록했습니다."/></p>
    </section>

    <section id="profile-history" className="mt-20 scroll-mt-28 sm:mt-28" aria-labelledby="profile-history-heading">
      <SectionHeading id="profile-history-heading" english="HISTORY" title="활동 기록" description="S 공개부터 최근 유닛 활동까지 주요 기록"/>
      <ol className="border-t border-white/[.14]">
        {highlights.map(item => <li key={`${item.date}-${item.title}`} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 border-b border-white/[.09] py-5 sm:grid-cols-[125px_minmax(0,1fr)] sm:gap-8 sm:py-6">
          <time className="pt-1 text-[11px] tabular-nums text-[#ccb3c2]">{item.date}</time>
          <div><h3 className="text-[15px] font-medium text-paper sm:text-[17px]"><Trans value={item.title}/></h3><p className="mt-2 max-w-3xl text-[12px] leading-6 text-ash"><Trans value={item.detail}/></p></div>
        </li>)}
      </ol>
    </section>

    <section id="profile-voice" className="mt-20 scroll-mt-28 sm:mt-28" aria-labelledby="profile-voice-heading">
      <SectionHeading id="profile-voice-heading" english="VOICE & MUSIC" title="보컬과 음악" description="확인 가능한 참여 이력을 중심으로 정리한 박시온의 음악 활동"/>
      <div className="grid gap-3 md:grid-cols-3">
        {voiceNotes.map(item => <article key={item.name} className="rounded-sm border border-white/[.1] bg-white/[.025] p-6">
          <h3 className="text-[16px] font-medium text-paper"><Trans value={item.name}/></h3>
          <p className="mt-4 text-[12px] leading-[1.9] text-ash"><Trans value={item.detail}/></p>
        </article>)}
      </div>
    </section>

    <section id="profile-nicknames" className="mt-20 scroll-mt-28 sm:mt-28" aria-labelledby="profile-nicknames-heading">
      <SectionHeading id="profile-nicknames-heading" english="NICKNAMES" title="별명" description="본인 인터뷰에 등장한 애칭과 팬 커뮤니티에서 사용하는 호칭을 구분했습니다."/>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nicknameList.map(item => <article key={item.name} className="rounded-sm border border-white/[.1] bg-[#17161b] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[17px] font-medium text-paper"><Trans value={item.name}/></h3><span className="text-[10px] text-[#cbb0c1]"><Trans value={item.origin}/></span></div>
          <p className="mt-3 text-[12px] leading-6 text-ash"><Trans value={item.text}/></p>
        </article>)}
      </div>
    </section>

    <section id="profile-interests" className="mt-20 scroll-mt-28 sm:mt-28" aria-labelledby="profile-interests-heading">
      <SectionHeading id="profile-interests-heading" english="INTERESTS" title="취미와 취향"/>
      <div className="grid gap-3 md:grid-cols-2">
        {interestGroups.map(group => <article key={group.title} className="rounded-sm border border-white/[.1] bg-white/[.025] p-5 sm:p-7">
          <h3 className="text-[17px] font-medium text-paper"><Trans value={group.title}/></h3>
          <p className="mt-2 text-[12px] leading-6 text-ash"><Trans value={group.description}/></p>
          <div className="mt-5 flex flex-wrap gap-2">{group.items.map(item => <Pill key={item}>{item}</Pill>)}</div>
          <p className="mt-5 text-[10px] text-[#9e95a0]"><Trans value={group.source}/></p>
        </article>)}
      </div>
    </section>

    <section id="profile-interview" className="mt-20 scroll-mt-28 sm:mt-28" aria-labelledby="profile-interview-heading">
      <SectionHeading id="profile-interview-heading" english="INTERVIEW NOTES" title="인터뷰에서 알게 된 시온" description="Droptokyo 인터뷰를 한국어로 간결하게 요약했습니다. 직접 인용이 아닌 요약입니다."/>
      <div className="grid gap-3 md:grid-cols-2">
        {interview.map((item, index) => <article key={item.title} className="grid grid-cols-[26px_1fr] gap-3 border-b border-white/[.12] py-5 sm:gap-4 sm:py-6">
          <span className="text-[10px] tabular-nums text-ash">{String(index + 1).padStart(2, '0')}</span>
          <div><h3 className="text-[15px] font-medium text-paper"><Trans value={item.title}/></h3><p className="mt-3 text-[12px] leading-6 text-ash"><Trans value={item.description}/></p></div>
        </article>)}
      </div>
      <a className="mt-5 inline-flex items-center gap-2 text-[12px] text-[#e0bdd0] underline decoration-white/25 underline-offset-4 hover:text-white" target="_blank" rel="noopener noreferrer" href="https://droptokyo.com/wedrop/334219/"><Trans value="Droptokyo 인터뷰 원문 "/><ArrowIcon width={15} height={15}/></a>
    </section>

    <section id="profile-references" className="mt-20 scroll-mt-28 sm:mt-28" aria-labelledby="profile-references-heading">
      <SectionHeading id="profile-references-heading" english="REFERENCES" title="정보 출처" description="공식 자료와 본인 인터뷰를 우선하며, 팬 자료에서 정리한 내용은 별도로 표시합니다."/>
      <div className="divide-y divide-white/[.09] border-y border-white/[.14]">
        {sources.map(item => <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-5 transition-colors duration-[250ms] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d6b4c8]">
          <span className="min-w-0"><span className="mb-1 block text-[10px] text-[#c6aabb]"><Trans value={item.kind}/></span><span className="block text-[13px] font-medium text-paper"><Trans value={item.label}/></span><span className="mt-1 block text-[11px] leading-5 text-ash"><Trans value={item.detail}/></span></span>
          <ArrowIcon width={16} height={16}/>
        </a>)}
      </div>
      <p className="mt-5 text-[11px] leading-[1.9] text-ash"><Trans value="확인일 2026.11.14 · SHION ARCHIVE는 비공식 팬사이트입니다. MBTI, 별명, 유닛 활동 상태 등 변동 가능한 정보는 출처와 시점에 따라 차이가 있을 수 있습니다."/></p>
    </section>
  </section>;
}
