/** Read an optional item deep-link from the application's hash route. */
export function getRouteItem(screen: string): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [route, query = ''] = hash.split('?', 2);
  const normalized = route === 'photo' ? 'photos' : route === 'video' || route === 'videos' ? 'film' : route === 'objekt' ? 'collection' : route;
  if (normalized !== screen) return null;
  const value = new URLSearchParams(query).get('item');
  return value && value.length <= 180 ? value : null;
}

/** Closing a deep-linked detail should leave the user at the selected archive menu. */
export function clearRouteItem(screen: string): void {
  if (typeof window === 'undefined' || !getRouteItem(screen)) return;
  const route = window.location.hash.split('?')[0];
  const address = `${window.location.pathname}${window.location.search}${route}`;
  window.history.replaceState(window.history.state, '', address);
}
