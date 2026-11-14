import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
const shared: IconProps = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
export function SearchIcon(props: IconProps) {
  return <svg {...shared} {...props} viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4.3 4.3" /></svg>;
}
export function HeartIcon(props: IconProps) {
  return <svg {...shared} {...props} viewBox="0 0 24 24"><path d="M20.4 5.9a5.3 5.3 0 0 0-7.5 0l-.9.9-.9-.9a5.3 5.3 0 1 0-7.5 7.5L12 21l8.4-7.6a5.3 5.3 0 0 0 0-7.5Z" /></svg>;
}
export function ArrowIcon(props: IconProps) {
  return <svg {...shared} {...props} viewBox="0 0 24 24"><path d="M4 12h16m-7-7 7 7-7 7" /></svg>;
}
export function CloseIcon(props: IconProps) {
  return <svg {...shared} {...props} viewBox="0 0 24 24"><path d="M5 5 19 19M19 5 5 19" /></svg>;
}
export function GridIcon(props: IconProps) {
  return <svg {...shared} {...props} viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/></svg>;
}
export function TrophyIcon(props: IconProps) {
  return <svg {...shared} {...props} viewBox="0 0 24 24"><path d="M7 3h10v5a5 5 0 0 1-10 0V3Zm0 2H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4M12 13v5m-4 3h8m-7-3h6" /></svg>;
}
