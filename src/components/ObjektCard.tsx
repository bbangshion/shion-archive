import { useI18n } from '../i18n/I18nContext';
import type { Objekt } from '../types/objekt';
import { HeartIcon } from './Icons';
import { ObjektArtwork, objektLabel } from './ObjektArtwork';

type Props = {
  item: Objekt;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpen: (item: Objekt) => void;
};

export function ObjektCard({ item, isFavorite, onToggleFavorite, onOpen }: Props) {
  const { t } = useI18n();
  const label = objektLabel(item);

  return (
    <article className="group min-w-0">
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`${item.season} ${label} ${t("사진 확대")}`}
          className="block w-full rounded-lg text-left transition-transform duration-[250ms] ease-plush motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush"
        >
          <ObjektArtwork item={item} />
        </button>
        <button
          type="button"
          aria-label={`${label} ${t(isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가')}`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(item.id)}
          className={`absolute bottom-2.5 right-2.5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/65 backdrop-blur-sm transition-colors duration-[250ms] ease-plush hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush ${isFavorite ? 'text-blush' : 'text-white'}`}
        >
          <HeartIcon width={19} height={19} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="mt-2.5 block w-full min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush"
      >
        <h3 className="break-words text-[14px] font-semibold leading-5 text-paper">{label}</h3>
        <p className="mt-1 text-[11px] leading-5 text-ash sm:text-xs">
          <span>{item.season}</span>
          <span aria-hidden="true" className="mx-1.5 text-ash/55">/</span>
          <span>{item.className}</span>
        </p>
      </button>
    </article>
  );
}
