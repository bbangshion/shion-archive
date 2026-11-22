import { useEffect } from 'react';
import { useArchive } from '../state/ArchiveContext';

/**
 * A lightweight, one-time scroll reveal. Never intercept native scroll events:
 * that would make Android touch scrolling janky and drain the battery.
 * Only visible sections/cards animate; modals, hero, navigation and World Cup
 * interactions are intentionally excluded.
 */
const REVEAL_TARGETS = [
  '.shion-home-explore .shion-section-lead',
  '.shion-home-explore .shion-feature-card',
  '.shion-home-footnote',
  '.shion-overview-lead',
  '.shion-overview-stats',
  '.shion-overview-photo',
  '.shion-overview-film',
  '.shion-timeline-entry',
  '.shion-history-year',
  '.shion-history-event',
  '.shion-subpage .shion-page-heading',
  '.shion-subpage .shion-page-crumb',
  '.shion-profile-intro',
  '.shion-profile-portrait',
  '.shion-profile-info',
  '.shion-profile-sub',
  '.shion-photo-group-head',
  '.shion-photo-grid .shion-gallery-tile',
  '.shion-film-grid .shion-film-card',
  '.shion-search-results .shion-search-result',

].join(', ');

export default function ScrollReveal() {
  const { screen } = useArchive();

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      !('MutationObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    // Respect data saver and avoid unnecessary effects on very low-end devices.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const root = document.getElementById('root');
    if (!root) return;
    const seen = new WeakSet<Element>();
    const pending = new Set<HTMLElement>();
    const running = new Set<HTMLElement>();
    const animationTimers = new Map<HTMLElement, number>();
    const cleanupCallbacks = new Map<HTMLElement, () => void>();
    const viewportHeight = () => window.innerHeight || document.documentElement.clientHeight;

    const done = (element: HTMLElement) => {
      running.delete(element);
      element.classList.remove('shion-reveal-enter');
      element.style.removeProperty('--shion-reveal-delay');
      cleanupCallbacks.get(element)?.();
      cleanupCallbacks.delete(element);
      const timer = animationTimers.get(element);
      if (timer !== undefined) window.clearTimeout(timer);
      animationTimers.delete(element);
    };

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        io.unobserve(element);
        pending.delete(element);
        element.classList.remove('shion-reveal-pending');
        running.add(element);
        element.classList.add('shion-reveal-enter');
        const finish = () => done(element);
        element.addEventListener('animationend', finish, { once: true });
        cleanupCallbacks.set(element, () => element.removeEventListener('animationend', finish));
        // Even when animations are cancelled or unsupported, nothing stays hidden.
        animationTimers.set(element, window.setTimeout(finish, 850));
      }
    }, { rootMargin: '0px 0px 80px 0px', threshold: 0.05 });

    const register = (element: Element) => {
      if (!(element instanceof HTMLElement) || seen.has(element)) return;
      if (!element.closest('#main-content')) return;
      // Fixed navigation, overlays and interactive tournament choices are not animated.
      if (element.closest('.shion-lightbox, .shion-film-dialog, .shion-top-four, .shion-menu-open')) return;
      seen.add(element);

      const rect = element.getBoundingClientRect();
      // Content visible when the user enters a menu should never flash or hide.
      if (rect.top <= viewportHeight() + 60 && rect.bottom >= -30) return;
      const siblings = element.parentElement?.children;
      const offset = siblings ? Array.prototype.indexOf.call(siblings, element) : 0;
      element.style.setProperty('--shion-reveal-delay', `${Math.max(0, offset % 4) * 38}ms`);
      element.classList.add('shion-reveal-pending');
      pending.add(element);
      io.observe(element);
    };

    const scan = (base: ParentNode) => {
      if (base instanceof Element && base.matches(REVEAL_TARGETS)) register(base);
      base.querySelectorAll(REVEAL_TARGETS).forEach(register);
    };

    scan(root);
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node);
        });
      }
    });
    // Only react to inserted/removed nodes, never class/style attribute updates.
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      pending.forEach((element) => {
        element.classList.remove('shion-reveal-pending');
        element.style.removeProperty('--shion-reveal-delay');
      });
      running.forEach(done);
    };
  }, [screen]);

  return null;
}
