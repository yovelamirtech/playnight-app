# PlayNight — מצב הפרויקט והמשך עבודה

> מסמך המשכיות. נכתב בסוף סשן הפיתוח של שלב 1.
> **סדר קריאה:** קודם `PLAYNIGHT_SPEC.md` במלואו, אחר כך המסמך הזה, אחר כך `IDEAS.md`.

---

## 1. כללי עבודה קבועים

1. TypeScript קפדני (strict). אסור `any`.
2. כל קובץ מתחת ל-200 שורות. קובץ שמתנפח — פצל לרכיבים/hooks/utils.
3. לוגיקה עסקית (מנוע ההמלצה, sessionFit, מנוע הכיול) בפונקציות טהורות
   ב-`src/lib/`, נפרדות מה-UI, עם unit tests.
4. הספרייה עובדת אופליין. SQLite הוא מקור האמת, Supabase הוא sync ברקע.
5. אל תבנה פיצ'ר שלא ב-SPEC. רעיון שעולה תוך כדי — ל-`IDEAS.md`, וממשיכים.
6. מסך "מה לשחק?" (§3.2) ומסך ה-Swipe (§3.3) הם הלב — אין בהם ספינר,
   עיכוב, או תחושת טעינה. כל השאר יכול להיות פחות מהודק.
7. בסוף כל שלב: הרץ את האפליקציה בפועל וּודא שהיא עולה בלי קריסה.
   תגיד מפורשות "בדקתי, זה עובד" או דווח על הבעיה.
8. משהו לא ברור או נראה שגוי טכנית — עצור ושאל. אל תנחש.

**כלל תשיעי שנלמד בסשן הזה:** אל תסתפק בטסטים על נתונים שהמצאת.
טבלת המיפוי עברה 16 טסטים ירוקים, ובנתוני IGDB אמיתיים התברר ששליש
מהקטלוג קיבל פרופיל הפוך. **תמיד תריץ מול נתוני אמת לפני שאתה מכריז שגמרת.**

---

## 2. סביבת עבודה

- פיתוח על **Windows 10**. אין Xcode ואין סימולטור.
- הרצה: `npx expo start` + סריקת QR מאייפון. **עובד ישירות ב-LAN, בלי `--tunnel`.**
- משלב 4: Development Build (RevenueCat הוא native module). הבנייה
  הנייטיבית נעשית ע"י המשתמש על ה-Mac שלו — **אל תתכנן EAS ואל תניח גישה ל-Xcode.**
- שחרור אנדרואיד קודם, לפי §8.
- **`expo start --web` לא עובד** ואינו יעד. ראה §6.

### הרצה — שני טרמינלים

```bash
npm run dev        # עוזרי פיתוח: פרוקסי IGDB + כלי תיוג + שכבת web
npx expo start     # האפליקציה
```

| שירות | כתובת |
|---|---|
| פרוקסי IGDB | `http://localhost:8787` (ו-`192.168.68.101:8787` מהטלפון) |
| כלי תיוג | `http://localhost:8788` — מקומי בלבד בכוונה |
| שכבת web | `http://localhost:8091` → Expo על 8081 |

---

## 3. מה בנוי — שלב 1 הושלם

```
src/
  app/            _layout · index (מה לשחק?) · swipe · library · game/[id] · add-game · settings
  components/     ui/ (6) · home/ (3) · library/ (2) · addGame/ (3)
  db/             schema/ (§6, 8 טבלאות) · client · bootstrap · repositories/gamesRepo · useDatabaseReady
  i18n/           en.ts (כל הטקסט) · types.ts · index.ts
  lib/igdb/       IgdbGateway + httpGateway + mockGateway + טסטים
  lib/sessionProfile/  archetype · archetypes · mappingTable + טסטים
  store/          useDecisionStore
  constants/      session · theme
tools/            dev-server · igdb-proxy/ · tagger/ · dev-web/
drizzle/          מיגרציה 0000 + migrations.js
```

**עובד מקצה לקצה:** מסך בית (זמן + מצב רוח) → ספרייה ריקה → הוספת משחק
(ידנית או חיפוש IGDB חי) → מופיע ב-Backlog → מסך משחק בודד.

**שלד בלבד:** `swipe.tsx`, `settings.tsx`, וטאבים של הספרייה מעבר ל-Backlog.

### Stack
Expo SDK 57 · RN 0.86 · React 19.2 · Expo Router · NativeWind 4.2.6 +
Tailwind 3 · Zustand 5 · expo-sqlite + Drizzle · vitest · tsx (לכלים)

---

## 4. החלטות שהתקבלו — אל תפתח מחדש בלי סיבה

| # | החלטה | נימוק |
|---|---|---|
| 1 | **הממשק באנגלית.** כל הטקסט ב-`src/i18n/en.ts` | §5 מתמחר בדולרים ו-§8 מגייס מ-r/patientgamers. עברית תתווסף כ-`he.ts` שמקיים את הטיפוס `Dictionary` — TypeScript יכשל אם חסר מפתח. אז גם צריך לכפות RTL. |
| 2 | **IGDB דרך פרוקסי מקומי** (`tools/igdb-proxy`) | סודות לא נכנסים לבאנדל. רק `EXPO_PUBLIC_*` מגיע לאפליקציה — אומת שאף אחד מארבעת הסודות לא בבאנדל. |
| 3 | **מיפוי ארכיטיפים: keywords → themes → genres → ברירת מחדל שמרנית** | ל-IGDB אין ז'אנר "roguelike". Hades מתויג `Role-playing (RPG)` בז'אנרים ו-`roguelike` ב-keywords. |
| 4 | **נוסף ארכיטיפ `arcadeSession`** (10 דק', ניתן לעצירה) | **לא ב-SPEC.** §4.4 לא מכסה משחקים מבוססי-מאץ' קצר (Rocket League, Tekken). בלעדיו הם לא הוצעו לערב קצר — הפוך מהאמת. |
| 5 | **בהתנגשות, הפרופיל הזהיר גובר** | טעות לכיוון "אל תציע" עולה למשתמש פחות מטעות לכיוון "תיכנס, יהיה בסדר". |

---

## 5. מלכודות שנתגלו — אל תיפול בהן שוב

### IGDB

- **`where category = 0` מחזיר אפס תוצאות** כשמבקשים את מלוא רשימת השדות.
  בודד ואומת. משתמשים ב-`total_rating_count > 40 & version_parent = null`.
- **theme `Open world` הוא איך ש-IGDB מתייגת בפועל**, לא keyword. Witcher 3
  ו-Skyrim מגיעים כך. מיפוי לא עקבי בין השדות נתן להם "20 דק', אפשר לעצור".
  אותו מושג חייב להוביל לאותו ארכיטיפ בכל שדה.
- **ז'אנר `Tactical` = יורה טקטי** (Counter-Strike), לא משחק תורות.
- **`permadeath` הוא סימן חלש** — Minecraft (hardcore) יצא roguelike.
- **`keywords` הוא שדה רועש** (`netflix`, `you can pet the dog`, מועמדויות
  לפרסים). רק whitelist מפורש, אף פעם לא קבלה עיוורת.
- מגבלת קצב: 4 בקשות/שנייה. יש debounce של 250ms בשדה החיפוש.

### סביבה

- **`expo start --web` לא עובד.** נפתרו כבר: NativeWind דורש
  `darkMode: 'class'`, ו-expo-sqlite דורש cross-origin isolation (יש שכבה
  ב-`tools/dev-web` שמוסיפה את הכותרות ואומתה — `crossOriginIsolated: true`).
  **החסם שנשאר הוא באג ב-expo-sqlite עצמו:** `Sync operation timeout`.
  עקיפה = שכבת DB שנייה לדפדפן. לא שווה — web אינו יעד.
- **Windows Firewall:** אם `--tunnel` נדרש פתאום, חפש כללי **חסימה** על
  `node.exe` (נוצרים כשלוחצים Cancel על חלון ההרשאה). **כלל חסימה גובר על
  כלל התרה**, אז הוספת כלל התרה לא תעזור. זה היה חסום ותוקן — אם קופץ חלון
  כזה בעתיד, ללחוץ **Allow**.
- **מיגרציות Drizzle** דורשות `babel-plugin-inline-import` + `sourceExts.push('sql')`.
- **`tools/` הוא TypeScript ורץ עם `tsx`**, כדי לייבא את
  `resolveSessionProfile` מ-`src/` — אין עותק שני של טבלת המיפוי.
  יש לו `tsconfig.json` נפרד (types: node); ה-tsconfig של האפליקציה מחריג את `tools`.
- `@expo/ngrok` נכנס ל-devDependencies מהרצת `--tunnel`. אפשר להסיר.

---

## 6. מה פתוח — צריך החלטת משתמש

1. **האם ה-seed נשלח עם האפליקציה לכל המשתמשים?** ההמלצה שניתנה: כן,
   אבל **כברירת מחדל שנכנעת** — למלא `typical_session_minutes` ו-`interruptible`
   אבל להשאיר `is_calibrated = false` ו-`session_reports_count = 0`, כדי
   ש-§4.5 ימשיך לשאול ונתוני אמת יחליפו. **טרם אושר.** עד שיוחלט,
   `seed/session-profiles.json` לא מחובר לאפליקציה ונמצא ב-`.gitignore`.
2. **ז'אנר `Platform`** לא ממופה. Celeste (שלבים קצרים) מול Mario Odyssey
   (עולם פתוח) — אין דרך להבדיל מהתגיות.
3. **`Real Time Strategy (RTS)` ממופה כרגע ל-`turnBasedStrategy`** (60 דק').
   מאץ' RTS הוא בפועל 20–40 דקות.

## 7. המשימה הבאה

**המשתמש מתייג 300 משחקים** ב-`http://localhost:8788` (מקלדת: `Enter`
מאשר את הניחוש, `Y`/`N` + `1`–`4` לתיקון, `S` דילוג, `←` אחורה. נשמר
אחרי כל תשובה, אפשר לעצור ולחזור).

**כשהתיוג מתקדם:** לבדוק את אחוז `agreedWithGuess` בקובץ. כל אי-הסכמה
היא באג פוטנציאלי בטבלת המיפוי — זה מדד האיכות של `src/lib/sessionProfile`.

**ואז שלב 2 (§8):** ייבוא Steam · חיבור מסך הבית לנתונים · מנוע ההמלצה
(§4.1, פונקציה טהורה עם טסטים) · מסך Swipe עם Reanimated.

נתיבי Steam (`ResolveVanityURL` + `GetOwnedGames`) נבנים באותו פרוקסי,
`tools/igdb-proxy` — התשתית והסודות כבר שם.

---

## 8. בדיקות לפני שמכריזים "עובד"

```bash
npm run typecheck   # אפליקציה + כלים. חייב exit 0
npm test            # 25 טסטים
npx expo export --platform android
npx expo export --platform ios
```

ואז הרצה בפועל על הטלפון. **אין קומיטים** — הריפו מכיל רק את
`Initial commit` של התבנית, וכל העבודה עדיין ב-working tree.
