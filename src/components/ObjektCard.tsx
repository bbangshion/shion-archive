import type { Objekt } from '../types/objekt';
import { HeartIcon } from './Icons';
import { ObjektArtwork } from './ObjektArtwork';
import { objektLabel } from '../lib/catalog';

type Props = {
  item: Objekt;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpen: (item: Objekt) => void;
};

export function ObjektCard({ item, isFavorite, onToggleFavorite, onOpen }: Props) {
  const label = objektLabel(item);
  return (
    <article className="group min-w-0">
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`${item.season} ${label} 상세 보기`}
          className="block w-full rounded-lg text-left transition-transform duration-[250ms] ease-plush motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush"
        >
          <ObjektArtwork item={item} />
        </button>
        <button
          type="button"
          aria-label={isFavorite ? `${label} 즐겨찾기 해제` : `${label} 즐겨찾기 추가`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(item.id)}
          className={`absolute bottom-2.5 right-2.5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/65 text-paper backdrop-blur-sm transition-[color,background-color] duration-[250ms] ease-plush hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush ${isFavorite ? 'text-blush' : ''}`}
        >
          <HeartIcon width={19} height={19} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button type="button" onClick={() => onOpen(item)} className="mt-2.5 block w-full min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-[14px] font-semibold leading-5 text-paper">{label}</h3>
          <span className="shrink-0 text-[11px] leading-5 text-ash">{item.season}</span>
        </div>
        <p className="mt-1 line-clamp-1 text-[11px] text-ash sm:text-xs">{item.series === item.className ? item.className : `${item.series} / ${item.className}`}</p>
      </button>
    </article>
  );
}
