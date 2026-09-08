# PlayNight — הוראות עבודה ל-Claude Code

קודם תקרא את `PLAYNIGHT_SPEC.md` (האפיון המלא), אחר כך `HANDOFF.md` (מצב
נוכחי והחלטות שהתקבלו), ואז את הכללים כאן.

## כללי קוד קבועים

1. TypeScript קפדני (strict). אסור `any`.
2. כל קובץ מתחת ל-200 שורות. קובץ שמתנפח — פצל לרכיבים/hooks/utils.
3. לוגיקה עסקית (מנוע ההמלצה, sessionFit, מנוע הכיול) בפונקציות טהורות
   ב-`src/lib/`, נפרדת מה-UI, עם unit tests.
4. הספרייה עובדת אופליין. SQLite (`expo-sqlite` + Drizzle) הוא מקור
   האמת; Supabase הוא sync ברקע בלבד.
5. אל תבנה פיצ'ר שלא ב-SPEC. רעיון שעולה תוך כדי עבודה → ל-`IDEAS.md`,
   וממשיכים בלי לסטות.
6. מסך "מה לשחק?" ומסך ה-Swipe הם הלב של המוצר — אין בהם ספינר, עיכוב,
   או תחושת טעינה. כל שאר המסכים יכולים להיות פחות מהודקים.
7. בסוף כל שלב עבודה: הרץ את האפליקציה בפועל וּודא שהיא עולה בלי
   קריסה. דווח מפורשות "בדקתי, זה עובד" או תאר את הבעיה שנתקלת בה.
8. אל תסתפק בטסטים על נתונים מומצאים — תמיד תריץ מול נתוני אמת (IGDB
   חי, לא מוקים) לפני שמכריזים שגמרת פיצ'ר שתלוי בנתונים חיצוניים.
9. משהו לא ברור או נראה שגוי טכנית — עצור ושאל. אל תנחש.

## סביבת עבודה

- פיתוח על **Windows 10**. אין Xcode ואין סימולטור iOS — בנייה נייטיבית
  (Development Build, לצורך RevenueCat וכו') נעשית ע"י המשתמש על ה-Mac
  שלו בעצמו. אל תתכנן EAS build ואל תניח גישה ל-Xcode.
- הרצה מקומית בשני טרמינלים:
  ```bash
  npm run dev        # עוזרי פיתוח: פרוקסי IGDB + כלי תיוג + שכבת web
  npx expo start      # האפליקציה עצמה — סריקת QR מהטלפון, עובד ב-LAN בלי --tunnel
  ```
- `expo start --web` לא עובד ואינו יעד נתמך.

## פקודות שימושיות

```bash
npm run lint        # expo lint
npm run typecheck   # tsc --noEmit (אפליקציה + tools)
npm test            # vitest run
npm run db:generate # יצירת מיגרציית Drizzle חדשה
```

## מבנה הריפו

```
src/
  app/            מסכי Expo Router
  components/     רכיבי UI, מאורגנים לפי תחום (ui/ home/ library/ addGame/)
  db/             schema, client, bootstrap, repositories
  i18n/           כל הטקסט באפליקציה — לא hardcoded בתוך הרכיבים
  lib/            לוגיקה עסקית טהורה (igdb gateway, sessionProfile, וכו')
  store/          Zustand stores
  constants/
tools/            dev-server, igdb-proxy, tagger, dev-web — כלי פיתוח, לא חלק מהאפליקציה
drizzle/          מיגרציות SQL
seed/             נתוני seed לתיוג פרופילי סשן
```

ראו `CLAUDE.md` לכללי git workflow (branch/PR/deploy).
