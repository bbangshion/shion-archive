# SHION ARCHIVE — OBJEKT SYSTEM v1.0

**CREATED BY @bbangshion** · tripleS S20 박시온을 위한 비공식 팬메이드 아카이브

## 구현 완료된 범위

- **COLLECTION:** S20만 추출, 검색, 시리즈·시즌 필터, 정렬, 36개 단위 점진적 렌더링, 상세 모달, 즐겨찾기(LocalStorage)
- **WORLD CUP:** 4/8/16/32강 무작위 대진표, 1:1 선택, 다음 라운드, 이전 선택 취소, 재시작, 우승 화면, 결과 공유
- **품질:** React + TypeScript(strict) + Tailwind CSS, 모바일 화면, 이미지 지연 로딩, 이미지 실패 대체, 데이터 오류 처리, reduced-motion 대응
- **운영:** GitHub Pages Actions 자동 빌드/배포

**주의:** `public/data/objekt.json`의 16개 S20 카드는 인터페이스 검증용 가상 샘플입니다. 실제 사진, 실물 객체, 발매 시리즈, 일련번호로 오해하면 안 됩니다. 샘플에는 타 멤버 2개도 포함되어 있으며 S20 정밀 필터링이 제외합니다.

## 데이터 흐름

```text
public/data/objekt.json
   ↓ fetch + AbortController
useCatalog (loading / error / ready)
   ↓ createCatalog → normalize + member=S20_SHION 전용 필터 + 중복 ID 제거
Objekt[] ────────────────────┐
   ↓                        ↓
Collection            TournamentArena
   ↓                        ↓
검색/시리즈/시즌/정렬     브래킷 / 대결 / 우승
   ↓                        ↓
36개 점진 렌더링         state 기반 상태 전이
   └──────────┬─────────────┘
              ↓
      ArchiveContext (screen / catalog / favorites)
              ↓
      useFavorites / localStorage
```

## 로컬 개발

Node.js 20.19+ 혹은 22+ 권장.

```bash
npm install
npm run dev
# 개발 서버: 터미널 출력 주소
npm run build
```

`npm run build`는 TypeScript 타입 검사 + Vite 정적 빌드를 수행합니다.

## 데이터 교체 (중요)

현재 테스트 데이터 파일 `public/data/objekt.json`을 실제 WAV ARCHIVE Objekt 카탈로그 JSON으로 **통째로 교체**하면 됩니다. 다른 파일은 수정할 필요 없습니다. 지원 형식:

```json
{
  "objekts": [
    {
      "id": "verified-unique-id",
      "member": "S20_SHION",
      "title": "실제 카드명",
      "imageUrl": "https://example.org/actual-card.jpg",
      "series": "실제 시리즈명",
      "season": "2026",
      "class": "실제 등급",
      "issuedAt": "2026-08-15",
      "serial": "000001"
    },
    {
      "id": "other-member-example",
      "member": "S21",
      "title": "S20이 아니므로 표시되지 않음"
    }
  ]
}
```

- 루트 배열(`[{...}]`)과 `{ objekts: [...] }`, `{ items: [...] }`, `{ data: { items: [...] } }`를 받습니다.
- 멤버 코드가 정확히 `S20`, `S20_SHION`, `박시온`, `SHION`, `PARKSHION` 등으로 지정된 행만 표시합니다. 제목 문자열에 시온이 포함됐다는 이유만으로 표시하지 않습니다.
- 사진 `imageUrl`, `image_url`, `image`, `thumbnail` 지원. 이미지가 없거나 깨졌을 때 디자인용 플레이스홀더로 표시합니다.
- 발매일이 없으면 타이틀/ID를 기준으로 안정적으로 정렬합니다.
- 기존 WAV ARCHIVE JSON **원본 필드가 다른 경우** `src/lib/catalog.ts`의 alias 매핑에 실제 필드 키를 추가해야 합니다. 본 파일은 해당 원본의 정확한 JSON 스키마를 검증한 버전이 아닙니다.
- `demo:true`는 샘플 전용 표시용으로 실제 데이터에는 넣지 않습니다.
- 외부 이미지는 원본 제공처의 hotlink/CORS/저작권 정책에 따라 노출이 제한될 수 있습니다. 권리 및 출처 확인 후 사용하세요.

## GitHub Pages 업로드 (휴대전화에서도 가능)

1. 새 GitHub 리포지토리 **`shion-archive`**를 만들고 `main` 브랜치를 사용합니다. WAV ARCHIVE 기존 저장소를 덮어쓰지 마세요.
2. 이 ZIP의 압축을 풀고 **프로젝트 최상단 폴더 안의 내용**을 업로드합니다. `package.json`, `src/`, `public/`, `.github/workflows/deploy.yml` 등이 루트에 있어야 합니다.
3. GitHub 리포지토리 `Settings` → `Pages` → `Build and deployment` → `Source: GitHub Actions`로 설정합니다.
4. `Actions` 탭에서 `Deploy SHION ARCHIVE` 성공을 확인합니다. 기본 주소는 `https://<username>.github.io/shion-archive/`입니다.
5. 실제 WAV 데이터 수집 후 `public/data/objekt.json`을 교체해 업로드합니다. 푸시할 때마다 자동 재배포됩니다.

GitHub Pages는 서버에서 실행되는 Next.js가 아닌 **정적 Vite/React 프로젝트**가 적합하므로 이 구성을 선택했습니다. 다른 4개 시스템(HOME, PHOTO, FILM, TIMELINE)은 이번 1차 범위가 아니며 이후 별도 모듈로 추가 가능합니다.

## 시스템 유지보수

- `src/types/objekt.ts` — 모델과 타입
- `src/lib/catalog.ts` — `SHION_QUERY = { member: "S20_SHION" }`, 안전한 데이터 정규화와 S20 전용 필터
- `src/lib/tournament.ts` — 대진표 상태 전이 (UI와 독립)
- `src/hooks/useCatalog.ts` — 데이터 fetch/오류/재시도
- `src/hooks/useFavorites.ts` — 로컬 즐겨찾기
- `src/state/ArchiveContext.tsx` — Context API 전역 상태
- `src/components/Collection.tsx` — 탐색 UI
- `src/components/TournamentArena.tsx` — 월드컵 UI
- `src/components/ObjektArtwork.tsx` — 이미지/플레이스홀더
- `src/components/DetailDialog.tsx` — 접근성 있는 상세 보기
- `src/App.tsx` — 상단 브랜드, 화면 전환, 전역 데이터 흐름

## 보안 및 개인정보

- 로그인, 서버, 분석 트래커, 광고 스크립트, API 키 사용 없음
- 즐겨찾기는 방문자 로컬 저장소에만 보관
- 이미지 URL은 HTTPS/HTTP 또는 프로젝트 내부 경로로 제한
- 입력은 React에서 기본 이스케이프하며 HTML 문자열을 직접 삽입하지 않음
