import { useState } from 'react';
import type { Objekt } from '../types/objekt';

type Props = { item: Objekt; eager?: boolean; large?: boolean };

export function ObjektArtwork({ item, eager = false, large = false }: Props) {
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const showImage = !!item.imageUrl && brokenUrl !== item.imageUrl;
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[9px] bg-[#29262E]">
      {showImage ? (
        <img
          src={item.imageUrl ?? undefined}
          alt={`${item.title} 오브젝트 이미지`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setBrokenUrl(item.imageUrl)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-between overflow-hidden border border-white/[.07] bg-[linear-gradient(140deg,#302B35,#1E1D24_68%,#333039)] px-[9%] py-[11%] text-paper">
          <div className="flex w-full items-start justify-between text-[9px] font-medium tracking-[.16em] text-white/60 sm:text-[10px]">
            <span>S20 / SHION</span><span>OBJ.</span>
          </div>
          <div className="select-none text-center">
            <div className={`${large ? 'text-[clamp(58px,12vw,132px)]' : 'text-[clamp(36px,7vw,90px)]'} font-light leading-none tracking-[-.085em] text-[#E5D8E1]/90`}>S.</div>
            <div className="mt-3 text-[9px] tracking-[.32em] text-white/45 sm:text-[11px]">SHION ARCHIVE</div>
          </div>
          <div className="flex w-full items-end justify-between gap-2 border-t border-white/15 pt-3 text-[8px] uppercase tracking-[.13em] text-white/60 sm:text-[10px]">
            <span className="truncate">{item.series}</span><span className="shrink-0">S20</span>
          </div>
        </div>
      )}
      {item.isDemo && <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-[.12em] text-white">SAMPLE</div>}
    </div>
  );
}
