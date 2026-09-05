import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * הטסטים רצים על לוגיקה טהורה ב-src/lib בלבד (כלל 3),
 * ולכן אין צורך בסביבת React Native.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/lib/**/*.test.ts'],
  },
});
