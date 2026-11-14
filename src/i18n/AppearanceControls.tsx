import { useEffect, useRef, useState } from 'react';
import { useI18n } from './I18nContext';
import type { Language } from './messages';
import type { Theme } from './I18nContext';

const themes: readonly { id: Theme; name: string; color: string }[] = [
  { id: 'obsidian', name: '블랙', color: '#18171d' },
  { id: 'violet', name: '우주 보라', color: '#342544' },
  { id: 'navy', name: '미드나잇 블루', color: '#1b2c4f' },
  { id: 'rose', name: '로즈', color: '#4b273c' },
  { id: 'aqua', name: '딥 아쿠아', color: '#173f45' },
];

export function AppearanceControls() {
  const { language, setLanguage, theme, setTheme, t } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return <div className="shion-appearance" ref={root}>
    <label className="shion-language-control">
      <span className="sr-only">{t('언어')}</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t('언어')}>
        <option value="ko">KO</option><option value="en">EN</option><option value="ja">JA</option>
      </select>
    </label>
    <button type="button" className="shion-theme-toggle" aria-expanded={open} aria-controls="shion-themes" aria-label={t('색상 설정')} title={t('테마')} onClick={() => setOpen(!open)}>
      <span className="shion-theme-disc" aria-hidden="true"/><span className="sr-only">{t('테마')}</span>
    </button>
    {open && <div id="shion-themes" className="shion-theme-popover" role="group" aria-label={t('색상 설정')}>
      <div className="shion-theme-heading">{t('색상 설정')}</div>
      <div className="shion-theme-options">
        {themes.map((option) => <button key={option.id} type="button" aria-pressed={theme === option.id} onClick={() => { setTheme(option.id); setOpen(false); }}>
          <span className="shion-theme-swatch" data-swatch={option.id} aria-hidden="true"/>
          <span>{t(option.name)}</span>
          {theme === option.id && <span aria-hidden="true" className="shion-theme-check">✓</span>}
        </button>)}
      </div>
    </div>}
  </div>;
}
