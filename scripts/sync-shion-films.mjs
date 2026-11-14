/**
 * SHION FILM | official-video indexer, Node 22, zero npm dependencies.
 * - Seeded, individually linked official recordings.
 * - Optionally reads structured WAV ARCHIVE SIGNAL files, selecting explicit S20 tags.
 * - Optionally scans tripleS official channel's uploaded videos via YouTube Data API.
 * - Optionally finds title-explicit ShiOn broadcasts from official TV channel accounts.
 * Avoids assigning every tripleS SIGNAL to S20. Does not download videos.
 * Run: node scripts/sync-shion-films.mjs [--self-test] [--offline]
 */
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const SEED = path.join(ROOT, 'public/data/films-seed.json');
const OUTPUT = path.join(ROOT, 'public/data/films.json');
const WAV_REPO = 'bbangshion/wav-archive';
const GITHUB_API = `https://api.github.com/repos/${WAV_REPO}`;
const WAV_RAW = `https://raw.githubusercontent.com/${WAV_REPO}/main/`;
const OFFICIAL_CHANNEL = 'tripleS official';
const MAX_WAV_FILES = 26;
const MAX_SOURCE_BYTES = 13 * 1024 * 1024;
const MAX_OFFICIAL_PAGES = 100;
const MAX_SEARCH_PAGES = 1;
const TRUSTED_TV_CHANNELS = new Set([
  'KBS Kpop', 'KBS WORLD TV', 'KBS Kpop Classic', 'MBCkpop',
  'MBC every1', 'ALL THE K-POP', 'Mnet K-POP', 'M2',
  'SBSKPOP X INKIGAYO', 'SBS Entertainment', 'THE K-POP', '1theK (원더케이)',
]);
const SEED_MIN = 5;
const nowISO = new Date().toISOString();

const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
const str = (x) => typeof x === 'string' ? x.trim() : '';
const norm = (x) => str(x).normalize('NFKC').toLowerCase().replace(/[\s._-]+/g, '');
const explicitlyShion = (x) => /시온|박시온|shi[\s._-]*on|shion|s20(?!\d)|빵숀/i.test(str(x));
const unitInTitle = (x) => /(?:tripleS\s*)?\bNXT\b|hatchi|∞!|msnz[\s._-]*moon/i.test(str(x));
const collectiveMV = (x) => /\bGirls Never Die\b|\bAre You Alive\b|깨어|\bBaby Flower\b|\bAndless\b/i.test(str(x));
const tidy = (x, limit=200) => str(x).slice(0,limit);
const cleanDate = (x) => /^\d{4}-\d\d-\d\d/.test(str(x)) && !Number.isNaN(Date.parse(str(x))) ? str(x).slice(0,10) : null;
function videoId(x) {
  if (isObj(x)) return videoId(x.id ?? x.videoId ?? x.url);
  const value = str(x);
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:') return '';
    const host = u.hostname.toLowerCase();
    let v = '';
    if (host === 'youtu.be') v = u.pathname.split('/')[1];
    else if (['www.youtube.com','youtube.com','m.youtube.com','music.youtube.com','www.youtube-nocookie.com'].includes(host)) {
      if (u.pathname === '/watch') v = u.searchParams.get('v') ?? '';
      else if (/^\/(embed|shorts|live)\//.test(u.pathname)) v = u.pathname.split('/')[2];
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : '';
  } catch { return ''; }
}
function isS20Tag(x) {
  if (Array.isArray(x)) return x.some(isS20Tag);
  if (isObj(x)) return ['id','code','number','memberId','name','slug','member','nameKo','nameEn'].some(k=>isS20Tag(x[k]));
  return ['s20','20','shion','parkshion','박시온','시온','s20shion'].includes(norm(String(x ?? '')));
}
function hasShionMember(row) {
  if (!isObj(row)) return false;
  return ['memberIds','members','memberId','member','participants','cast','featuredMembers','memberCodes'].some(k=>isS20Tag(row[k]));
}
function categoryOf(title, raw='') {
  const value = `${str(raw)} ${title}`.toLowerCase();
  if (/signal\s*live|signal_live|\blive\b|라이브|생방송/.test(value)) return 'live';
  if (/signal|시그널|secretbase|sssignal/.test(value)) return 'signal';
  if (/직캠|fancam|focuscam|facecam|performance|무대|stage|댄스|dance\s*practice|choreography|music\s*bank|mcountdown|inkigayo/.test(value)) return 'performance';
  if (/official\s*(mv|music video)|\bmv\b|뮤직비디오|visualizer|visual\s*clip|music/.test(value)) return 'music';
  return 'other';
}
function groupOf(title) {
  if (/msnz[\s._-]*moon/i.test(title)) return 'Moon';
  if (/\bhatchi\b|∞!/i.test(title)) return '∞! (Hatchi)';
  if (/\bNXT\b/i.test(title)) return 'NXT';
  if (/24인|OT24|Girls Never Die|Are You Alive|Baby Flower|Andless|깨어/i.test(title)) return 'tripleS';
  return '박시온';
}
function scopeOf(title) {
  if (unitInTitle(title)) return 'unit';
  if (/24인|OT24|Girls Never Die|Are You Alive|Baby Flower|Andless|깨어/i.test(title)) return 'group';
  return 'solo';
}
function recordFrom(row, source) {
  if (!isObj(row)) return null;
  const id = videoId(row.youtubeId ?? row.youtubeUrl ?? row.videoId ?? row.videoUrl ?? row.youtube ?? row.url ?? row.link ?? row.id);
  const title = tidy(row.title ?? row.name ?? row.videoTitle, 190);
  if (!id || !title) return null;
  const tagged = hasShionMember(row);
  const named = explicitlyShion(title);
  // No mass importing unrelated group videos from the WAV archive.
  // Unit/OT24 is accepted when the official video source itself is known.
  if (!tagged && !named) return null;
  const channel = tidy(row.channelTitle ?? row.channel ?? row.uploader, 70);
  if (channel && /fan|reaction|cover/i.test(channel) && channel !== OFFICIAL_CHANNEL) return null;
  return {
    youtubeId: id, title,
    category: categoryOf(title, row.category ?? row.type),
    publishedAt: cleanDate(row.publishedAt ?? row.uploadedAt ?? row.published ?? row.date),
    memberIds: ['S20'], group: tidy(row.group ?? row.dimension, 55) || groupOf(title),
    scope: tidy(row.scope) || scopeOf(title),
    source: channel || source,
    verified: Boolean(row.verified === true || (channel === OFFICIAL_CHANNEL && (named || tagged))),
    note: tidy(row.note,120),
  };
}
function addRecords(target, rows, source) {
  let count = 0;
  for (const row of rows) {
    const f = recordFrom(row,source);
    if (!f) continue;
    const prev = target.get(f.youtubeId);
    if (prev) {
      // Prefer verified seed titles, allow new dates and verification status.
      target.set(f.youtubeId, {
        ...f, ...prev,
        publishedAt: prev.publishedAt ?? f.publishedAt,
        verified: prev.verified === true || f.verified === true,
        source: prev.source === 'tripleS official' ? prev.source : f.source,
      });
    } else {
      target.set(f.youtubeId,f);
      count++;
    }
  }
  return count;
}
function extractArrays(payload) {
  const found = [];
  const visited = new WeakSet();
  function walk(value, depth) {
    if (depth > 6 || !value || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      if (value.some(row=>isObj(row) && (row.videoId || row.youtubeId || row.youtubeUrl || row.videoUrl || row.title))) found.push(value);
      else if (depth < 4) for (const child of value.slice(0,5000)) walk(child,depth+1);
      return;
    }
    for (const key of ['signals','videos','items','entries','rows','records','catalog','data','results','archive','list']) if (key in value) walk(value[key],depth+1);
  }
  walk(payload,0);
  return found.flat();
}
async function fetchLimited(url, {timeoutMs=22000, maxBytes=MAX_SOURCE_BYTES, headers={}}={}) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const res = await fetch(url,{signal:controller.signal,headers:{'User-Agent':'SHION-ARCHIVE-FILM-INDEX/1.6',...headers}});
    if (!res.ok) throw Error(`HTTP ${res.status} (${new URL(url).hostname})`);
    if (+res.headers.get('content-length') > maxBytes) throw Error('파일 크기 제한 초과');
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength > maxBytes) throw Error('파일 크기 제한 초과');
    return JSON.parse(new TextDecoder().decode(bytes));
  } finally {clearTimeout(timer);}
}
async function collectWav(target) {
  let total = 0; let checked = 0; let files=[];
  try {
    const tree = await fetchLimited(`${GITHUB_API}/git/trees/main?recursive=1`,{timeoutMs:18000,maxBytes:5*1024*1024,headers:{Accept:'application/vnd.github+json'}});
    if (tree.truncated) console.warn('WAV repository tree truncated; some files may be missed');
    files = (tree.tree ?? []).filter(f=>
      f.type === 'blob' && /\.json$/i.test(f.path) &&
      /signal|video|youtube|film|media/i.test(f.path) &&
      !/objekt|backup|\.map\.|node_modules|dist/i.test(f.path) &&
      (f.size ?? 0) <= MAX_SOURCE_BYTES
    ).sort((a,b)=>/signal/i.test(b.path) - /signal/i.test(a.path)).slice(0,MAX_WAV_FILES).map(f=>f.path);
  } catch (error) { console.warn(`WAV 파일 목록 확인 실패: ${error.message}`); }
  const extras = str(process.env.WAV_SIGNAL_JSON_URLS).split(/[\n,;]/).map(s=>s.trim()).filter(s=>s.startsWith('https://'));
  const sources = [...files.map(p=>WAV_RAW+p.split('/').map(encodeURIComponent).join('/')), ...extras];
  for (let i=0;i<sources.length;i+=3) {
    const batch = sources.slice(i,i+3);
    const result = await Promise.allSettled(batch.map(url=>fetchLimited(url)));
    for (let index=0;index<batch.length;index++) {
      if (result[index].status !== 'fulfilled') continue;
      checked++;
      const rows = extractArrays(result[index].value);
      total+=addRecords(target,rows,'WAV ARCHIVE · 공식 영상');
    }
  }
  console.log(`WAV catalog discovery: ${files.length} likely files, ${checked} parsed, ${total} new S20-tagged videos`);
  return {files:files.length,checked,added:total};
}
function decodeXml(value) {
  return String(value).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([a-f0-9]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replace(/&(?:amp|lt|gt|quot|apos);/g,(m)=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[m]));
}
async function collectOfficialFeeds(target) {
  const urls=[
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCJnL-TBcsYrF2SLs7tmiC8Q',
    'https://www.youtube.com/feeds/videos.xml?playlist_id=PLZlIsCBsz6M0m1pSdgigWuzBt5Cnby6Ok',
    'https://www.youtube.com/feeds/videos.xml?playlist_id=PLZlIsCBsz6M10dOsSVQftYVpnQbN17cre',
  ];
  let added=0;
  for (const url of urls) {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'Mozilla/5.0'}});
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const xml=(await response.text()).slice(0,2*1024*1024);
      const rows=[];
      for (const [,entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
        const id=entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
        const title=decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
        const date=entry.match(/<published>([^<]+)<\/published>/)?.[1];
        if (!id || !title) continue;
        const row=youtubeRowFromSnippet({title,publishedAt:date},videoId(id),OFFICIAL_CHANNEL);
        if (row) rows.push(row);
      }
      added+=addRecords(target,rows,OFFICIAL_CHANNEL);
    } catch(e) { console.warn(`YouTube 공식 공개 피드 미수신: ${e.message}`); }
    finally {clearTimeout(timeout);}
  }
  return {added};
}

async function youtubeApi(resource, params, key) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
  for (const [k,v] of Object.entries({...params,key})) if (v) url.searchParams.set(k,String(v));
  return fetchLimited(url.href,{timeoutMs:22000,maxBytes:3*1024*1024});
}
function youtubeRowFromSnippet(snippet, id, channel, mode='official') {
  const title = tidy(snippet.title,190);
  const explicit = explicitlyShion(title);
  const unit = unitInTitle(title);
  const groupMV = /official\s*(?:mv|music\s*video)/i.test(title) && collectiveMV(title);
  if (!id || !title || (!explicit && !(mode === 'official' && (unit || groupMV)))) return null;
  return {
    youtubeId:id, title,
    category:categoryOf(title),
    publishedAt:cleanDate(snippet.publishedAt),
    memberIds:['S20'], group:groupOf(title),scope:scopeOf(title),
    source:channel,
    verified:true,
  };
}
async function collectYoutube(target,key) {
  const stats={channelPages:0,officialAdded:0,tvAdded:0};
  if (!key) { console.log('YOUTUBE_API_KEY 미설정: YouTube 전체 업로드 스캔 생략');return stats; }
  const c=await youtubeApi('channels',{part:'contentDetails,snippet',forHandle:'triplescosmos'},key);
  const channel = c.items?.[0];
  const playlist=channel?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlist || !/tripleS/i.test(channel.snippet?.title??'')) throw Error('공식 tripleS 채널 확인 실패');
  let token='';
  const all=[];
  for (let page=0;page<MAX_OFFICIAL_PAGES;page++) {
    const batch=await youtubeApi('playlistItems',{part:'snippet,contentDetails',playlistId:playlist,maxResults:50,pageToken:token},key);
    stats.channelPages++;
    for (const item of batch.items??[]) {
      const snippet = item.snippet;
      const vid = videoId(item.contentDetails?.videoId ?? snippet?.resourceId?.videoId);
      const row = youtubeRowFromSnippet(snippet,vid,OFFICIAL_CHANNEL);
      if (row) all.push(row);
    }
    token=batch.nextPageToken??'';
    if (!token) break;
  }
  stats.officialAdded=addRecords(target,all,OFFICIAL_CHANNEL);
  console.log(`YouTube official channel: ${stats.channelPages} pages / ${stats.officialAdded} new videos`);
  // Broad TV search is intentionally limited to explicit S20 titles and broadcaster channels.
  for (const query of ['tripleS 박시온 직캠','tripleS ShiOn fancam','tripleS 박시온 무대']) {
    let pageToken='';
    for (let page=0;page<MAX_SEARCH_PAGES;page++) {
      try {
        const payload=await youtubeApi('search',{part:'snippet',q:query,type:'video',maxResults:50,publishedAfter:'2023-12-23T00:00:00Z',pageToken},key);
        const rows=(payload.items??[]).flatMap(item=>{
          if (!TRUSTED_TV_CHANNELS.has(item.snippet?.channelTitle)) return [];
          const record=youtubeRowFromSnippet(item.snippet,videoId(item.id?.videoId),item.snippet.channelTitle,'broadcast');
          return record?[record]:[];
        });
        stats.tvAdded+=addRecords(target,rows,'방송사 공식 채널');
        pageToken=payload.nextPageToken??'';
        if (!pageToken) break;
      }catch(e){console.warn(`방송사 검색 ${query}: ${e.message}`);break;}
    }
  }
  console.log(`Official broadcast title-explicit S20: ${stats.tvAdded} new videos`);
  return stats;
}
async function loadJSON(file) {
  const raw=JSON.parse(await readFile(file,'utf8'));
  if (!isObj(raw)||!Array.isArray(raw.items)) throw Error(`Invalid films source ${file}`);
  return raw;
}
async function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const seed=await loadJSON(SEED);
  if (seed.items.length<SEED_MIN) throw Error('FILM seed unexpectedly small; refusing to overwrite');
  const records=new Map();
  addRecords(records,seed.items,'tripleS official');
  // Preserve previously deposited data. Can be 1.5 or an older 1.6 deployment.
  try { const prev=await loadJSON(OUTPUT);addRecords(records,prev.items,'existing'); }
  catch (error) { console.warn(`기존 파일 건너뜀: ${error.message}`); }
  if (!process.argv.includes('--offline')) {
    try {
      const previous=await fetchLimited('https://bbangshion.github.io/shion-archive/data/films.json',{timeoutMs:9000,maxBytes:5*1024*1024});
      if (Array.isArray(previous.items)) addRecords(records,previous.items,'배포본');
    } catch { console.log('기존 배포본 없음/접근 불가, 프로젝트 데이터 사용'); }
  }
  let wav={status:'offline'};
  let official={status:'disabled'};
  let atom={status:'offline'};
  if (!process.argv.includes('--offline')) {
    try { atom={status:'ok',...await collectOfficialFeeds(records)}; } catch(e) {atom={status:'unavailable',error:e.message};}
    try { wav={status:'ok',...await collectWav(records)}; }
    catch(e){wav={status:'unavailable',error:e.message};console.warn(e.message);}
    try { official={status:process.env.YOUTUBE_API_KEY?'ok':'no-api-key',...await collectYoutube(records,process.env.YOUTUBE_API_KEY)}; }
    catch(e){official={status:'unavailable',error:e.message};console.warn(`공식 채널 조회 실패: ${e.message}`);}
  }
  if (records.size<seed.items.length) throw Error('Video count below seed. Preserve previous snapshot.');
  const items=[...records.values()].sort((a,b)=>(b.publishedAt??'').localeCompare(a.publishedAt??'')||a.title.localeCompare(b.title,'ko'));
  const result={version:2,generatedAt:nowISO,items,coverage:{
    description:'공식 링크 중심, S20 명시 또는 확인된 참여 유닛/완전체 영상. 모든 출연 영상의 완전 수록을 보장하지 않습니다.',
    shionCount:items.length,
    categoryCounts:Object.fromEntries(['signal','music','performance','live','other'].map(cat=>[cat,items.filter(f=>f.category===cat).length])),
    wav,official,atom,
  }};
  await mkdir(path.dirname(OUTPUT),{recursive:true});
  const tmp=OUTPUT+'.tmp';
  await writeFile(tmp,JSON.stringify(result,null,2)+'\n','utf8');
  await rename(tmp,OUTPUT);
  console.log(`SHION FILM ${result.items.length} entries => ${OUTPUT}`);
}
function assert(condition,message){if(!condition)throw Error(`SELF-TEST FAILED: ${message}`);}
function selfTest() {
  const testId='DvHr1Qz5olg';
  assert(videoId('https://youtu.be/'+testId)===testId,'shortlink ID');
  assert(videoId('https://www.youtube.com/watch?v='+testId)===testId,'watch ID');
  assert(!videoId('https://evil.example/watch?v='+testId),'non-YouTube blocked');
  assert(isS20Tag({id:'S20'}),'member tag');
  assert(!isS20Tag({id:'S21'}),'other members not included');
  const yes=recordFrom({title:'박시온 SIGNAL 240325',videoId:testId},'WAV ARCHIVE');
  const no=recordFrom({title:'연지 SIGNAL',videoId:'s3IfM-u5hVc',memberIds:['S12']},'WAV ARCHIVE');
  assert(yes?.category==='signal','category selection');
  assert(no===null,'S12 excluded');
  const found=extractArrays({data:{videos:[{videoId:testId,title:'박시온'}]}});
  assert(found.length===1,'nested arrays');
  const map=new Map();
  assert(addRecords(map,[{youtubeId:testId,title:'ShiOn SIGNAL',memberIds:['S20']}],'test')===1,'add');
  assert(addRecords(map,[{youtubeId:testId,title:'ShiOn SIGNAL',memberIds:['S20']}],'test')===0,'dedup');
  assert(youtubeRowFromSnippet({title:'tripleS Hatchi Password',publishedAt:'2025-10-01'},'m25wQkLg1jc','tripleS official')?.scope==='unit','official unit');
  assert(!youtubeRowFromSnippet({title:'Other member MV'},'m25wQkLg1jc','tripleS official'),'other MV rejected');
  console.log('SHION FILM sync self-tests: PASSED');
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e);process.exitCode=1});
export {videoId,isS20Tag,extractArrays,recordFrom,categoryOf,addRecords};
