import type { Objekt } from '../types/objekt';
import { HeartIcon } from './Icons';
import { ObjektArtwork } from './ObjektArtwork';

type Props = {
  item: Objekt;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpen: (item: Objekt) => void;
};

export function ObjektCard({ item, isFavorite, onToggleFavorite, onOpen }: Props) {
  return (
    <article className="group min-w-0">
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`${item.title} 상세 보기`}
          className="block w-full rounded-[9px] text-left transition-transform duration-[250ms] ease-plush hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush"
        >
          <ObjektArtwork item={item} />
        </button>
        <button
          type="button"
          aria-label={isFavorite ? `${item.title} 즐겨찾기 해제` : `${item.title} 즐겨찾기 추가`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(item.id)}
          className={`absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/55 text-paper backdrop-blur-md transition-all duration-[250ms] ease-plush hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush ${isFavorite ? 'text-blush' : ''}`}
        >
          <HeartIcon width={17} height={17} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button type="button" onClick={() => onOpen(item)} className="mt-3 block w-full min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[13px] font-medium text-paper sm:text-[14px]">{item.title}</h3>
          <span className="shrink-0 text-[10px] tracking-[.08em] text-ash/80">{item.season}</span>
        </div>
        <p className="mt-1 truncate text-[11px] text-ash sm:text-xs">{item.series} <span className="px-1 text-white/20">/</span> {item.className}</p>
      </button>
    </article>
  );
}
