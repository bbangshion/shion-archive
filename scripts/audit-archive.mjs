/**
 * SHION ARCHIVE 1.8 — read-only data integrity audit.
 *
 * Run after regular S20 Objekt / FILM sync. GitHub Actions can also use it
 * after the independent photo sync before committing newly imported metadata.
 * The audit NEVER edits photos.json, films.json or objekt.json.
 *
 *   node scripts/audit-archive.mjs --self-test
 *   node scripts/audit-archive.mjs --ci --protect-baseline --write
 *
 * --protect-baseline compares the current counts against the checked-out HEAD
 * and refuses an accidental count drop during background synchronization.
 * --write creates a small, public non-personal status JSON for later HOME 2.0.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const FILES = Object.freeze({
  photos: 'public/data/photos.json',
  films: 'public/data/films.json',
  objekt: 'public/data/objekt.json',
});
const STATUS = 'public/data/archive-health.json';
const args = new Set(process.argv.slice(2));

const record = (value) => value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' ? value.trim() : '';
const validDate = (value) => {
  if (value == null || value === '') return true; // older entries may not have exact dates
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(String(value))) return false;
  const date = String(value).slice(0, 10);
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === date;
};
const S20_REGEX = /^(?:S20(?:_?SHION)?|SHION|PARKSHION|박시온)$/i;
const s20 = (value) => {
  if (Array.isArray(value)) return value.some(s20);
  if (record(value)) return s20(value.memberId ?? value.id ?? value.member ?? value.code ?? value.name);
  return S20_REGEX.test(String(value ?? '').replace(/[.\s-]/g, ''));
};
const imageUrl = (value) => typeof value === 'string' && (
  /^https:\/\//i.test(value) || /^(?!\/)(?!\.)(?!.*\/\.\.\/)[\w./%-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(value)
);
const videoId = (value) => /^[\w-]{11}$/.test(text(value));

function entries(kind, raw) {
  if (kind === 'photos') return Array.isArray(raw) ? raw : record(raw) && Array.isArray(raw.photos) ? raw.photos : null;
  if (kind === 'films') return Array.isArray(raw) ? raw : record(raw) && Array.isArray(raw.items) ? raw.items : record(raw) && Array.isArray(raw.videos) ? raw.videos : null;
  return Array.isArray(raw) ? raw : record(raw) && Array.isArray(raw.objekts) ? raw.objekts : record(raw) && Array.isArray(raw.items) ? raw.items : null;
}

function inspect(kind, raw) {
  const rows = entries(kind, raw);
  if (!rows) return { count: 0, usable: 0, duplicateIds: 0, errors: [`${kind}: JSON array shape is invalid`], warnings: [] };
  const errors = [];
  const warnings = [];
  const seen = new Set();
  let usable = 0;
  let duplicateIds = 0;
  let missingDates = 0;
  let badDates = 0;
  let missingImages = 0;
  let nonS20 = 0;
  let demo = 0;
  for (const row of rows) {
    if (!record(row)) { errors.push(`${kind}: non-object entry`); continue; }
    const id = text(kind === 'films' ? row.youtubeId ?? row.videoId ?? row.id : row.id);
    if (!id) { errors.push(`${kind}: entry missing ID`); continue; }
    if (seen.has(id)) { duplicateIds += 1; continue; }
    seen.add(id);
    const identity = kind === 'films' ? row.memberIds ?? row.members ?? row.memberId ?? row.member : row.member ?? row.memberId ?? row.memberCode ?? row.member_code;
    if (kind === 'objekt' && !s20(identity)) nonS20++;
    if (kind === 'films' && !s20(identity)) nonS20++;
    if (kind === 'photos' && row.category && row.category !== 'photo') nonS20++;
    if (kind === 'films' && !videoId(row.youtubeId ?? row.videoId ?? row.id)) {
      errors.push(`${kind}: invalid YouTube ID (${id.slice(0, 35)})`); continue;
    }
    if (kind === 'photos' && !imageUrl(row.image)) {
      missingImages++; continue;
    }
    if (kind === 'objekt' && !imageUrl(row.imageUrl ?? row.image_url ?? row.image ?? '')) missingImages++;
    if ((kind === 'films' || kind === 'photos') && !validDate(row.publishedAt ?? row.date)) badDates++;
    if (kind === 'photos' && !text(row.date)) missingDates++;
    if (row.demo === true) demo++;
    usable++;
  }
  if (duplicateIds) errors.push(`${kind}: ${duplicateIds} repeated IDs`);
  if (rows.length && usable === 0) errors.push(`${kind}: no usable entries`);
  if (nonS20) warnings.push(`${kind}: ${nonS20} entries lack confirmed S20 tag or photo category`);
  if (missingImages) warnings.push(`${kind}: ${missingImages} image URLs missing or not web-safe`);
  if (badDates) warnings.push(`${kind}: ${badDates} malformed publication dates`);
  if (kind === 'photos' && missingDates) warnings.push(`${kind}: ${missingDates} undated photos (allowed)`);
  if (demo) warnings.push(`${kind}: ${demo} demo items (replaced by the regular WAV sync)`);
  return { count: rows.length, usable, duplicateIds, errors, warnings };
}

async function readData(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}
function baseline(kind, file) {
  try {
    // No shell interpolation. Not available during local zip tests without git.
    const snapshot = execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000, maxBuffer: 20_000_000 });
    return inspect(kind, JSON.parse(snapshot));
  } catch { return null; }
}
async function run() {
  const summary = {
    version: '1.8.0',
    checkedAt: new Date().toISOString(),
    counts: {},
    warnings: [],
    errors: [],
  };
  for (const [kind, file] of Object.entries(FILES)) {
    let result;
    try { result = inspect(kind, await readData(file)); }
    catch (error) {
      result = { count: 0, usable: 0, duplicateIds: 0, errors: [`${kind}: could not read JSON (${error.message})`], warnings: [] };
    }
    summary.counts[kind] = result.usable;
    summary.warnings.push(...result.warnings);
    summary.errors.push(...result.errors);
    if (args.has('--protect-baseline')) {
      const previous = baseline(kind, file);
      if (previous && previous.usable > result.usable) {
        summary.errors.push(`${kind}: data regression (${previous.usable} in HEAD → ${result.usable} now); refusing silent data loss`);
      }
    }
    console.log(`[archive audit] ${kind}: ${result.usable}/${result.count} usable`);
  }

  // Cache creation is best-effort because external hosts may disallow downloads.
  // The status still tells the operator whether PNG posters are likely to work.
  try {
    const cache = await readData('public/data/objekt-poster-map.json');
    summary.posterImages = record(cache?.sources) ? Object.keys(cache.sources).length : 0;
    if (summary.posterImages === 0) summary.warnings.push('worldcup: optimized poster photos unavailable; actual PNG export needs checking');
  } catch {
    summary.posterImages = 0;
    summary.warnings.push('worldcup: image cache report not found (expected before initial deployment)');
  }

  if (args.has('--write') && !summary.errors.length) {
    await fs.mkdir(path.dirname(STATUS), { recursive: true });
    const temp = `${STATUS}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(summary, null, 2) + '\n', 'utf8');
    await fs.rename(temp, STATUS);
    console.log(`[archive audit] wrote ${STATUS}`);
  }
  for (const warning of summary.warnings) console.warn(`[archive audit] WARN ${warning}`);
  for (const error of summary.errors) console.error(`[archive audit] ERROR ${error}`);
  console.log(`[archive audit] ${summary.errors.length} errors / ${summary.warnings.length} warnings`);
  if (summary.errors.length && args.has('--ci')) process.exitCode = 1;
}

function selfTest() {
  const obj = inspect('objekt', { objekts: [{ id: 'one', member: 'S20_SHION', imageUrl: 'https://example.com/1.png' }] });
  assert.equal(obj.usable, 1);
  assert.equal(obj.errors.length, 0);
  const photos = inspect('photos', [
    { id: 'one', image: 'https://example.com/1.png' },
    { id: 'one', image: 'https://example.com/1.png' },
  ]);
  assert.equal(photos.duplicateIds, 1);
  assert.equal(photos.errors.length, 1);
  const films = inspect('films', { items: [{ youtubeId: 'a1b2c3d4e5F', memberIds: ['S20'] }] });
  assert.equal(films.usable, 1);
  assert.ok(!validDate('2026-02-30'));
  assert.ok(validDate(null));
  console.log('archive audit self-test: PASSED');
}

if (args.has('--self-test') && args.size === 1) selfTest();
else if (args.has('--self-test')) { selfTest(); await run(); }
else await run();
