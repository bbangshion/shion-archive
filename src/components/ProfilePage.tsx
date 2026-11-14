import { ArrowIcon } from './Icons';

const PORTRAIT = `${import.meta.env.BASE_URL}images/shion-home.jpg`;

const facts = [
  { name: '이름', value: '박시온 · Park ShiOn' },
  { name: '그룹', value: 'tripleS' },
  { name: '멤버 번호', value: 'S20' },
  { name: '생년월일', value: '2006년 4월 3일' },
  { name: '혈액형', value: 'A형' },
  { name: 'MBTI', value: 'ESFP', note: 'tripleS 일본 공식 프로필 기준' },
] as const;

const units = [
  { name: 'NXT', description: '린 · 주빈 · 정하연 · 박시온', year: '2023' },
  { name: '∞! (Hatchi)', description: '일본 활동 디멘션', year: '2024' },
] as const;

export function ProfilePage() {
  return (
    <section className="shion-profile animate-appear" aria-labelledby="profile-heading">
      <header className="shion-page-heading">
        <span className="shion-page-kicker">PROFILE / S20</span>
        <h1 id="profile-heading">박시온</h1>
        <p>tripleS의 스무 번째 멤버</p>
      </header>

      <div className="shion-profile-intro">
        <figure className="shion-profile-portrait">
          <img src={PORTRAIT} alt="공항에서 촬영한 박시온" width="1152" height="1536" loading="eager" decoding="async" />
          <figcaption>Park ShiOn · S20</figcaption>
        </figure>
        <div className="shion-profile-info">
          <p className="shion-page-kicker">TRIPLES / SHION</p>
          <h2>Park ShiOn</h2>
          <p className="shion-profile-sub">박시온의 기본 정보와 활동을 모았습니다</p>
          <dl className="shion-fact-grid">
            {facts.map((fact) => (
              <div key={fact.name}>
                <dt>{fact.name}</dt>
                <dd>{fact.value}{'note' in fact && <small>{fact.note}</small>}</dd>
              </div>
            ))}
          </dl>
          <a className="shion-official-link" href="https://www.triples-official.jp/profile/" target="_blank" rel="noopener noreferrer">
            공식 프로필 보기 <ArrowIcon width={16} height={16} />
          </a>
        </div>
      </div>

      <section className="shion-profile-units" aria-labelledby="units-heading">
        <div className="shion-section-heading-inline"><span className="shion-page-kicker">DIMENSION</span><h2 id="units-heading">활동 유닛</h2></div>
        <div className="shion-unit-list">
          {units.map((unit) => (
            <article key={unit.name} className="shion-unit-row">
              <span>{unit.year}</span>
              <div><h3>{unit.name}</h3><p>{unit.description}</p></div>
            </article>
          ))}
        </div>
        <p className="shion-source-note">기본 정보: tripleS 공식 프로필 및 공식 멤버 소개 기준. 활동 내역은 순차적으로 추가됩니다.</p>
      </section>
    </section>
  );
}
