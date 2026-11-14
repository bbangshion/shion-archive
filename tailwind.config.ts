import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#101014',
        surface: '#17171C',
        raised: '#202027',
        line: '#35343C',
        paper: '#F5F2F0',
        ash: '#9C9AA3',
        blush: '#D9C6D6',
        violet: '#95859F',
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0 14px 44px rgba(0,0,0,.19)',
      },
      transitionTimingFunction: {
        plush: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
