import { useEffect, useRef } from 'react';
import type { Objekt } from '../types/objekt';
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
    ['MEMBER', 'S20 / 박시온'], ['COLLECTION', item.series],
    ['SEASON', item.season], ['CLASS', item.className],
    ['SERIAL', item.serial ?? '—'], ['ISSUED', item.issuedAt ?? '—'],
    ['ID', item.id],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div data-objekt-dialog role="dialog" aria-modal="true" aria-labelledby="objekt-dialog-title" className="relative max-h-[94dvh] w-full max-w-[790px] overflow-y-auto rounded-t-[22px] border border-white/[.08] bg-surface p-5 shadow-ambient sm:rounded-[22px] sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><p className="micro-label">SHION / OBJECT DETAIL</p><h2 id="objekt-dialog-title" className="mt-2 text-2xl font-semibold tracking-[-.045em] text-paper">{item.title}</h2></div>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="닫기" className="icon-button"><CloseIcon /></button>
        </div>
        <div className="grid gap-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-9">
          <div className="max-w-[360px]"><ObjektArtwork item={item} eager large /></div>
          <div className="flex flex-col">
            <p className="mb-4 text-sm leading-7 text-ash">{item.description ?? '시온의 Objekt를 기록하는 컬렉션 페이지입니다.'}</p>
            <dl className="divide-y divide-white/[.07] border-y border-white/[.09]">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 py-3">
                  <dt className="text-[10px] font-semibold tracking-[.15em] text-ash">{label}</dt>
                  <dd className="max-w-[64%] break-all text-right text-xs text-paper/90">{value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => onToggleFavorite(item.id)} className="btn-primary mt-7 w-full justify-center gap-2">
              <HeartIcon width={17} height={17} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? '즐겨찾기에서 제거' : '내 즐겨찾기에 저장'}
            </button>
            {item.isDemo && <p className="mt-4 text-xs leading-5 text-ash">현재 항목은 화면·기능 점검용 예시입니다. 실제 카드 정보는 원본 JSON 연결 후 표시됩니다.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
