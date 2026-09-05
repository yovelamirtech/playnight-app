/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // NativeWind on web refuses a runtime color-scheme switch under the default
  // 'media' strategy. We ship a single dark palette, so 'class' is the right mode.
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0B0D12',
        surface: '#151922',
        surfaceAlt: '#1E2430',
        border: '#2A3140',
        text: '#F2F4F8',
        muted: '#8B93A3',
        accent: '#6C5CE7',
        accentSoft: '#8F82F0',
        good: '#2ECC71',
        warn: '#F1C40F',
      },
    },
  },
  plugins: [],
};
