import { useState } from 'react';
import type { Objekt } from '../types/objekt';

type Props = { item: Objekt; eager?: boolean; large?: boolean };

export function ObjektArtwork({ item, eager = false }: Props) {
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const showImage = !!item.imageUrl && brokenUrl !== item.imageUrl;
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-white/[.045] bg-[#222127]">
      {showImage ? (
        <img
          src={item.imageUrl ?? undefined}
          alt={`${item.season} ${item.serial ?? item.title} 이미지`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setBrokenUrl(item.imageUrl)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#222127] px-4 text-center text-paper/65">
          <span className="text-[26px] font-light tracking-[-.06em]">SHION</span>
          <span className="text-xs text-ash">이미지 준비 중</span>
        </div>
      )}
      {item.isDemo && <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/75 px-2 py-1 text-[10px] text-white">미리보기</div>}
    </div>
  );
}
