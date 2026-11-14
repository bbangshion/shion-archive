import { useEffect, useRef } from 'react';
import type { Objekt } from '../types/objekt';
import { objektLabel } from '../lib/catalog';
import { CloseIcon, HeartIcon } from './Icons';
import { ObjektArtwork } from './ObjektArtwork';

type Props = {
  item: Objekt | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
};

export function DetailDialog({ item, isFavorite, onToggleFavorite, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!item) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const dialog = document.querySelector<HTMLElement>('[data-objekt-dialog]');
      const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', onKey);
      previousFocus.current?.focus();
    };
  }, [item, onClose]);

  if (!item) return null;
  const rows = [
    ['멤버', 'S20 박시온'], ['시리즈', item.series],
    ['시즌', item.season], ['클래스', item.className],
    ['카드 번호', item.serial ?? '—'], ['발행일', item.issuedAt ?? '—'],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div data-objekt-dialog role="dialog" aria-modal="true" aria-labelledby="objekt-dialog-title" className="max-h-[94dvh] w-full max-w-[760px] overflow-y-auto overscroll-contain rounded-t-2xl border border-white/[.08] bg-surface p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-ambient sm:rounded-2xl sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><p className="text-[11px] text-ash">{item.season}</p><h2 id="objekt-dialog-title" className="mt-1 break-words text-2xl font-semibold tracking-[-.045em] text-paper">{objektLabel(item)}</h2></div>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="닫기" className="icon-button"><CloseIcon /></button>
        </div>
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-8">
          <div className="mx-auto w-full max-w-[350px]"><ObjektArtwork item={item} eager large /></div>
          <div className="flex flex-col">
            {item.description && <p className="mb-4 text-sm leading-6 text-ash">{item.description}</p>}
            <dl className="divide-y divide-white/[.07] border-y border-white/[.09]">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 py-3">
                  <dt className="text-[12px] text-ash">{label}</dt>
                  <dd className="max-w-[65%] break-words text-right text-xs text-paper/90">{value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => onToggleFavorite(item.id)} className="btn-primary mt-6 w-full justify-center gap-2">
              <HeartIcon width={17} height={17} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            </button>
            {item.isDemo && <p className="mt-4 text-xs leading-5 text-ash">미리보기용 데이터입니다</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
