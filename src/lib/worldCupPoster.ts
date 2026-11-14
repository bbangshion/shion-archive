import type { Objekt } from '../types/objekt';
import { objektLabel } from '../components/ObjektArtwork';

/**
 * Create a clean, portrait share card using the tournament's REAL Objekt photos.
 * Cross-origin hosts without CORS support cannot be drawn into canvas. When that
 * happens, return the missing count so the UI never silently exports a photo-less
 * result as if it were a completed photo poster.
 */
export type PosterEntry = Readonly<{ item: Objekt }>;
export type PosterRender = { blob: Blob | null; missingImages: number };

type Box = Readonly<{ x: number; y: number; w: number; h: number }>;

function rounded(ctx: CanvasRenderingContext2D, box: Box, radius: number): void {
  const r = Math.min(radius, box.w / 2, box.h / 2);
  ctx.beginPath();
  ctx.moveTo(box.x + r, box.y);
  ctx.lineTo(box.x + box.w - r, box.y);
  ctx.quadraticCurveTo(box.x + box.w, box.y, box.x + box.w, box.y + r);
  ctx.lineTo(box.x + box.w, box.y + box.h - r);
  ctx.quadraticCurveTo(box.x + box.w, box.y + box.h, box.x + box.w - r, box.y + box.h);
  ctx.lineTo(box.x + r, box.y + box.h);
  ctx.quadraticCurveTo(box.x, box.y + box.h, box.x, box.y + box.h - r);
  ctx.lineTo(box.x, box.y + r);
  ctx.quadraticCurveTo(box.x, box.y, box.x + r, box.y);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number, startSize: number, minSize = 17): void {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `600 ${size}px system-ui, sans-serif`;
    if (ctx.measureText(value).width <= maxWidth) break;
    size -= 1;
  }
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  let text = value;
  if (ctx.measureText(text).width > maxWidth) {
    while (text.length && ctx.measureText(`${text}…`).width > maxWidth) text = text.slice(0, -1);
    text += '…';
  }
  ctx.fillText(text, 0, 0);
}

function fetchCanvasImage(url: string | null): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const complete = (value: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
      resolve(value);
    };
    // Important: set crossOrigin BEFORE src, so canvas stays readable.
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    const timeout = setTimeout(() => complete(null), 5500);
    img.onload = () => complete(img.naturalWidth && img.naturalHeight ? img : null);
    img.onerror = () => complete(null);
    img.src = url;
  });
}

function photo(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, box: Box, border: string): void {
  ctx.save();
  rounded(ctx, box, 15);
  ctx.clip();
  ctx.fillStyle = '#222027';
  ctx.fillRect(box.x, box.y, box.w, box.h);
  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const scale = Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight);
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;
    ctx.drawImage(img, box.x + (box.w - width) / 2, box.y + (box.h - height) / 2, width, height);
  } else {
    ctx.font = '600 29px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#706B76';
    ctx.fillText('SHION', box.x + box.w / 2, box.y + box.h / 2);
  }
  ctx.restore();
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;
  rounded(ctx, box, 15);
  ctx.stroke();
}

function line(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, 3);
}

async function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export async function renderWorldCupPoster(entries: readonly PosterEntry[], bracketSize: number): Promise<PosterRender> {
  if (entries.length !== 4) throw new Error('A top-four result requires four Objekt cards.');
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1390;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas rendering is not supported.');

  const images = await Promise.all(entries.map(({ item }) => fetchCanvasImage(item.imageUrl)));
  const missingImages = images.filter((img) => !img).length;

  ctx.fillStyle = '#101014';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#83808E';
  ctx.font = '600 19px system-ui, sans-serif';
  ctx.fillText('O B J E K T   W O R L D C U P', 540, 76);
  ctx.fillStyle = '#FBF8FC';
  ctx.font = '700 72px system-ui, sans-serif';
  ctx.fillText('ShiOn', 540, 156);
  ctx.fillStyle = '#9B94A3';
  ctx.font = '26px system-ui, sans-serif';
  ctx.fillText(`${bracketSize} · TOP 4`, 540, 200);

  // Hero winner: portrait, golden hairline, season and serial underneath.
  const gold = '#CBB57C';
  photo(ctx, images[0] ?? null, { x: 357, y: 221, w: 366, h: 549 }, gold);
  ctx.fillStyle = '#E7D09A';
  ctx.font = '600 18px system-ui, sans-serif';
  ctx.fillText('01   W I N N E R', 540, 798);
  const first = entries[0]!;
  ctx.fillStyle = '#F6F2F6';
  ctx.save();
  ctx.translate(540, 836);
  fitText(ctx, `${first.item.season}  ·  ${objektLabel(first.item).replace(/^#/, '')}`, 650, 37, 25);
  ctx.restore();

  // Smaller podium cards, 2 > 3 > 4 to match the user's reference.
  const places: Box[] = [
    { x: 176, y: 905, w: 216, h: 324 },
    { x: 447, y: 944, w: 190, h: 285 },
    { x: 687, y: 970, w: 170, h: 255 },
  ];
  const accents = ['#C9C5D3', '#BF9274', '#7E7B93'];
  for (let i = 1; i <= 3; i += 1) {
    const box = places[i - 1]!;
    const accent = accents[i - 1]!;
    const entry = entries[i]!;
    photo(ctx, images[i] ?? null, box, accent);
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.font = '600 27px system-ui, sans-serif';
    ctx.fillText(String(i + 1).padStart(2, '0'), box.x + box.w / 2, box.y - 16);
    line(ctx, box.x, box.y + box.h + 14, box.w, accent);
    ctx.save();
    ctx.translate(box.x + box.w / 2, box.y + box.h + 50);
    ctx.fillStyle = '#D2CED7';
    fitText(ctx, objektLabel(entry.item).replace(/^#/, '') || entry.item.season, box.w + 15, 21, 16);
    ctx.restore();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#77737F';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('SHION ARCHIVE  ·  @bbangshion', 540, 1361);
  // If a host blocks CORS, toBlob stays safe because only CORS images were drawn.
  return { blob: await canvasBlob(canvas), missingImages };
}
