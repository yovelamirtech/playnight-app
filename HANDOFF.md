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
| 6 | **ה-seed מחובר.** `addGameFromIgdb` (`src/db/repositories/gamesRepo.ts`) בודק `getSeedOverride(igdbId)` לפני שהוא נופל לברירת המחדל של הארכיטיפ | §6.1 הוכרעה (ראה §5 למטה — 43.7% מ-300 המשחקים לא הסכימו עם הניחוש). כמו שהומלץ: `is_calibrated` נשאר `false`, §4.5 ממשיך לאסוף דיווחים אמיתיים גם על המשחקים האלה. |
| 7 | **הוסר `strategy` (הז'אנר הגס) מ-`GENRE_TO_ARCHETYPE`** | נבדק מול נתוני התיוג האמיתיים — הז'אנר הזה מקצה `turnBasedStrategy` (60 דק', נעול) גם ל-Overwatch, Battlefield ו-Braid. `turn-based strategy (tbs)`, `real time strategy (rts)`, וה-keyword `turn-based` עדיין תופסים משחקי אסטרטגיה אמיתיים. |
| 8 | **`Real Time Strategy (RTS)` נשאר ממופה ל-`turnBasedStrategy`** | §6.3 (הישנה) העלתה ספק. נבדק מול הנתונים: StarCraft II, Age of Empires II ו-Warcraft III (RTS אמיתיים) **הסכימו** עם ברירת המחדל של 45–60 דק' נעולות. רק ה-StarCraft המקורי (1998) חרג. לא מספיק ראיות לשנות. |

---

## 5. מלכודות שנתגלו — אל תיפול בהן שוב

### IGDB

- **`where category = 0` מחזיר אפס תוצאות** כשמבקשים את מלוא רשימת השדות.
  בודד ואומת. משתמשים ב-`total_rating_count > 40 & version_parent = null`.
- **theme `Open world` הוא איך ש-IGDB מתייגת בפועל**, לא keyword. Witcher 3
  ו-Skyrim מגיעים כך. מיפוי לא עקבי בין השדות נתן להם "20 דק', אפשר לעצור".
  אותו מושג חייב להוביל לאותו ארכיטיפ בכל שדה.
- **ז'אנר `Tactical` = יורה טקטי** (Counter-Strike), לא משחק תורות.
- **ז'אנר `Strategy` (הכללי) רועש מדי — הוסר.** ראה החלטה #7 למעלה.
- **`permadeath` הוא סימן חלש** — Minecraft (hardcore) יצא roguelike.
- **`keywords` הוא שדה רועש** (`netflix`, `you can pet the dog`, מועמדויות
  לפרסים). רק whitelist מפורש, אף פעם לא קבלה עיוורת.
- מגבלת קצב: 4 בקשות/שנייה. יש debounce של 250ms בשדה החיפוש.
- **ז'אנר `Puzzle` גם הוא רועש, ולא תוקן.** IGDB מתייגת בו גם משחקי
  אימה-הישרדות עם אלמנטים של פאזל (Resident Evil, Silent Hill, Dead
  Space, Prey, Soma — 8-9 מ-300 המשחקים). ניסיתי כלל לפי theme
  `Horror`+`Survival`, אבל `Little Nightmares` (theme זהה, אבל פרופיל
  קצר ופתוח בפועל) שובר אותו — אין כלל keyword/genre/theme נקי שמפריד
  בין השתיים בלי overfitting למדגם. **זה בדיוק המקרה של seed override
  (החלטה #6)** — לא ניסיון לתקן את הטבלה עוד.
- **קטגוריית `openWorldStory` שבורה ל-4 תת-קבוצות אמיתיות** (מ-Zelda/Skyrim
  הפתוחים ב-20 דק' ועד Elden Ring/AC Origins/WoW הנעולים ב-75), ואין
  שילוב genres/themes/keywords שמפריד ביניהן באופן אמין (נבדק מול
  38 דוגמאות אמיתיות). כנ"ל — seed override, לא תיקון טבלה.

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

1. **ז'אנר `Platform`** לא ממופה. Celeste (שלבים קצרים) מול Mario Odyssey
   (עולם פתוח) — אין דרך להבדיל מהתגיות.

(הוחלט: seed מחובר — החלטה #6 למעלה. הוחלט: RTS נשאר כמו שהוא —
החלטה #8 למעלה.)

## 7. שלב 2 — התקדמות

### ייבוא Steam — הושלם

- `tools/igdb-proxy/steam.ts` — `resolveVanityUrl` + `getOwnedGames` מול
  Steam Web API, על אותו פרוקסי (`tools/igdb-proxy/server.ts`, נתיבים
  `/steam/resolve` ו-`/steam/games`). `STEAM_API_KEY` אופציונלי ב-`.env`:
  אם חסר, שאר הפרוקסי ממשיך לעבוד ורק נתיבי `/steam/*` מחזירים 501.
- `src/lib/steam/` — gateway בצד הקליינט, אותו דפוס בדיוק כמו
  `src/lib/igdb/` (mock בלי פרוקסי, http מולו, `getSteamGateway()`
  כנקודת כניסה יחידה). טסטים ב-`steam.test.ts`.
- `src/db/repositories/steamImportRepo.ts` — `importSteamGames` יוצר שורת
  קטלוג יציבה (`steam:<appid>`, מקביל ל-`igdb:<id>`), מקשר ל-`user_games`
  עם `hoursPlayed` אמיתי מ-Steam, ואידמפוטנטי (ריצה חוזרת מעדכנת שעות
  במקום ליצור כפילויות).
- **בכוונה בלי העשרת ז'אנר/ארכיטיפ מ-IGDB בשלב הזה** (§4.3: "אל
  תיתקע פה") — משחקי Steam מתחילים בברירת המחדל השמרנית (§4.4 החלטה
  #5), בדיוק כמו הוספה ידנית. §4.5 ממשיך לאסוף דיווחי סשן אמיתיים.
  שיפור עתידי אפשרי: התאמה ל-IGDB לפי שם, לתגי ז'אנר — נרשם ב-IDEAS.md,
  לא נבנה עכשיו.
- מסך חדש `src/app/connect-steam.tsx`: קלט Steam ID (17 ספרות) או שם
  פרופיל מותאם, resolve אם צריך, ואז ייבוא עם progress טקסטואלי
  ("Importing X/Y games…") — בלי ספינר, לפי §8 שלב 2 ("טעינה ברקע עם
  progress indicator"). נגיש מ-empty state של מסך הבית (`emptyConnect`,
  היה כפתור מת עם טקסט "coming soon") ומ-מסך ההגדרות (לresync חוזר,
  כי ה-empty state נעלם אחרי ייבוא ראשון).
- נוסף `'Steam'` ל-`PLATFORMS` (`src/constants/session.ts`) — לצד
  `Epic`/`GOG` שהם גם הם חנויות ולא חומרה, לא רק `PC`.

## 8. המשימה הבאה

**שלב 2 (§8 ב-SPEC) הושלם במלואו:**

1. ייבוא Steam — הושלם ונבדק (ראה §7). **עדיין לא נבדק בפועל על
   הטלפון עם `STEAM_API_KEY` אמיתי** — נשאר פתוח.
2. **מנוע ההמלצה** (`src/lib/recommendation/`) — פונקציה טהורה,
   `sessionFit` לפי §4.4, טסטים מלאים. הושלם בסשן קודם.
3. **מסך הבית מחובר לנתונים אמיתיים + מסך Swipe עם Reanimated** —
   הושלם בסשן הזה:
   - `src/db/repositories/swipeRepo.ts` — `getSwipeCandidates()` (JOIN
     `user_games`+`games`, בונה `SessionProfile` מ-`typicalSessionMinutes`/
     `interruptible`), `dismissForWeek()` (swipe שמאלה → `dismissedUntil`
     +7 ימים), `hideForever()` (swipe למעלה → `isHidden`).
   - `src/lib/timeAgo.ts` — עיצוב "לפני X ימים/חודשים/שנים" לשורת
     ה-"אבק" בכרטיס (§3.3), עם טסטים.
   - `src/components/swipe/SwipeCard.tsx` — כרטיס תצוגה (cover, שם,
     שורת session fit, פלטפורמה, "קנית/עצרת לפני...", ציון קהילה,
     עד 3 תגיות ז'אנר).
   - `src/components/swipe/SwipeDeck.tsx` — מחסנית 3 כרטיסים, gesture
     על העליון בלבד עם `Gesture.Pan`/`Gesture.Tap` + `useSharedValue`/
     `runOnJS` (Reanimated, לא Animated הישן). ימינה/שמאלה/למעלה לפי
     סף מרחק, tap פותח פרטים.
   - `src/app/swipe.tsx` — טוען מועמדים פעם אחת, מריץ
     `getRecommendations` עם `availableMinutes`/`mood` מה-store,
     "5 more options" מושך עוד מהמאגר שעוד לא הוצג, "Change filters"
     חוזר למסך הבית.
   - `src/app/_layout.tsx` — נוסף `GestureHandlerRootView` (נדרש ל-
     `react-native-gesture-handler`).

   **החלטת scope:** swipe ימינה ("זה! בוא נשחק") פותח כרגע את מסך
   פרטי המשחק הקיים, **לא** מסך אישור ייעודי — מסך האישור עם טיימר
   הסשן ("איפה עצרתי") הוא §3.4, ומשויך לשלב 3 ("הלולאה"), לא שלב 2.
   כנ"ל למסך הלוג המהיר (§3.5). לשנות בכוונה, לא לפתוח שוב בלי סיבה.

   **נבדק:** typecheck + lint + 82 טסטים (75 היו, +7 ל-`timeAgo`) +
   `expo export` לשתי הפלטפורמות — כולם עברו. **לא נבדק בפועל על
   מכשיר** (סביבת הפיתוח הזו היא remote/headless, בלי טלפון לסרוק
   QR) — הצעד הבא בפועל: להריץ `npx expo start` ולסרוק, לוודא
   שהמחוות מרגישות מיידיות (§3.3) ושה-DB מתעדכן נכון אחרי swipe.

## 8. שלב 3 ("הלולאה") — הושלם

כל 4 הפריטים שנשארו מ-§8 (הישן) הושלמו בסשן הזה:

1. **מסך אישור** (§3.4) — `src/app/session-confirm.tsx`. Cover, שם,
   כפתור "התחל סשן של X דק'" (X = `typicalSessionMinutes` של המשחק),
   טיימר רץ עם ספירה יורדת, שדה "איפה עצרתי", "סיימתי לשחק".
   **התראה עדינה בסוף הטיימר היא רק שינוי טקסט על המסך** (אין
   push notification רקעי אמיתי) — לא נבנה background timer/notification
   native, נשאר פתוח אם רוצים את זה בעתיד.
2. **מסך לוג מהיר** (§3.5) — `src/app/session-log.tsx`. דירוג
   😍/🙂/😐/😴 (`SESSION_RATINGS`), שאלת כיול מותנית (ראה #3), שדה
   הערה (מוזן מראש מ-session-confirm), "סיימת?" כן/לא, כפתור דילוג
   בולט שלא שומר כלום.
3. **מנוע כיול** (§4.5), MVP = שאלה #1 בלבד —
   `src/lib/calibration/pickQuestion.ts` (`shouldAskCalibrationQuestion`,
   פונקציה טהורה + טסטים: סף 15 דיווחים למשחק, חסם 3 שאלות ביום,
   opt-out). `src/lib/sessionLog/gameStats.ts` — עדכון `typicalSessionMinutes`
   (ממוצע נע) ו-`interruptible` (רוב כן/לא) מנתונים אמיתיים, פונקציות
   טהורות + טסטים. `src/db/repositories/sessionsRepo.ts.logSession()`
   מחבר הכל: כותב ל-`sessions`, ל-`calibration_answers` (אם נענתה
   שאלה #1), מעדכן צבירה ב-`games`, ומעדכן `user_games` (hoursPlayed,
   lastPlayedAt, status → `playing`/`beaten`). הגדרות (`settings.tsx`)
   כוללות את מתג "תפסיק לשאול אותי שאלות כיול" (§4.5.4).
4. **פילטרים/מיון בספרייה** (§3.6) — `src/lib/library/filterSort.ts`
   (פונקציות טהורות + טסטים): פילטר לפי פלטפורמה/ז'אנר/שנה, מיון לפי
   נוסף לאחרונה / ציון קהילה / אלפביתי / **"אבק"** (הכי מזמן לא נגעו,
   `lastPlayedAt ?? addedAt`). `src/components/library/LibraryFilters.tsx`
   מציג chips שנגזרים מהנתונים בטאב הנוכחי. **"זמן להשלמה" (HLTB)
   לא מומש** — אין מקור נתונים בסכימה כרגע (לא HLTB API, לא שדה ב-`games`);
   לא ניסיון לתקן, רק לתעד שהוא חסר.

בנוסף, לא ב-רשימה המקורית אבל דרוש כדי שהזרימה תיסגר: `game/[id].tsx`
מציג עכשיו היסטוריית סשנים ו"איפה עצרתי" אמיתיים (`getSessionHistory`/
`getStoppedNotes`), עם כפתור "אני משחק בזה" שנכנס למסך האישור גם
בלי לעבור דרך ה-swipe. `useActiveSessionStore` (כמו `useDecisionStore`)
מעביר את הסשן הפעיל בין המסכים בלי לגעת ב-DB עד "סיימתי לשחק".

**נבדק:** typecheck + lint + 93 טסטים (82 היו, +11 חדשים) + `expo export`
לשתי הפלטפורמות — כולם עברו. **לא נבדק בפועל על מכשיר** (סביבת הפיתוח
הזו remote/headless) — הצעד הבא: `npx expo start`, לוודא שהטיימר
מרגיש חי, שהלוג המהיר נשמר וש-`game/[id]` מציג את הסשן החדש.

**סביבה:** הרצת `npm install` בסשן הזה גילתה שגיאת typecheck קיימת
מראש שלא קשורה לשינויים כאן: `Cannot find module or type declarations
for side-effect import of '../global.css'` ב-`_layout.tsx`. אומת מול
`git stash` שהיא קיימת גם בלי השינויים — כנראה תלוי-סביבה (קובץ
declaration שנוצר בזמן build/codegen ולא נמצא כאן). לא תוקן — לא
קשור למשימה. אם זה חוזר בסשן הבא, לבדוק את `nativewind-env.d.ts`
ואת שלב הקודג'ן של nativewind.

## 9. מה נשאר פתוח לשלב 4+

1. ~~Timer notification אמיתי (push/background) בסוף סשן~~ — **הושלם
   בסשן הזה, ראה §12.**
2. ~~"זמן להשלמה" (HLTB)~~ — **הושלם בסשן הזה, ראה §15. לא נבדק מול
   HLTB חי — הסביבה הזו חסומה מגישה ל-howlongtobeat.com.**
3. Steam import — עדיין לא נבדק בפועל עם `STEAM_API_KEY` אמיתי (מ-§7).
   דורש שהמשתמש יריץ את זה בעצמו על הטלפון.
4. ~~שאלות כיול 2-5 מבנק השאלות (§4.5)~~ — **הושלם בסשן קודם, ראה §11.**
5. **Supabase Auth + sync (§8 שלב 4)** — הושלם בסשן הזה, ראה §16.
   **לא אומת מול פרויקט Supabase אמיתי בכלל** — אין עדיין פרויקט קיים,
   צריך שהמשתמש ייצור אחד ויריץ את המיגרציה הידנית. §16 להוראות מלאות.
6. עדיין לא בנוי משלב 4: RevenueCat (paywall), PostHog. לא התחלנו —
   מחכה להחלטת המשתמש על סדר עדיפויות בתוך השלב.

---

## 11. שאלות כיול 2-5 — הושלם

הרחבת מנוע הכיול (§4.5) מ-MVP (שאלה #1 בלבד) לבנק המלא:

- `src/lib/calibration/pickQuestion.ts` — `pickCalibrationQuestionId`
  (פונקציה טהורה + טסטים): שאלה #1 קודמת עד 8 תשובות, אחריה רוטציה
  משוקללת בין 2–5 לפי "פער בנתונים" (בדיוק לפי הפסאודו-קוד ב-§4.5).
  `random` מוזרק לטסט דטרמיניסטי.
- `src/lib/calibration/questionValues.ts` — טווחי שאלה #2 (בקטים →
  נקודת אמצע בדקות) ומיפוי שאלה #3 (תדירות שמירה → leans-interruptible),
  פונקציות טהורות + טסטים.
- `src/db/repositories/sessionsRepo.ts` — `logSession` מקבל עכשיו
  `CalibrationAnswerInput` גנרי (`{questionId, value}`) במקום Q1 בלבד:
  - שאלה #2 מזינה `typicalSessionMinutes`/`sessionReportsCount` באותו
    ממוצע נע כמו דיווח משך אמיתי (מצטבר איתו ברצף אם שניהם קרו).
  - שאלות #1 ו-#3 מזינות יחד את `interruptible`/`interruptibleReportsCount`
    (רוב מצטבר על שתי השאלות, כמו שה-SPEC מציין ל-Q3: "תוסף ל-interruptible").
  - שאלות #4 ו-#5 נשמרות גולמיות ל-`calibration_answers` **בלי** לעדכן
    שדה ב-`games` אוטומטית — Q4 היא ולידציה הפוכה (§4.5) בלי שדה מטרה
    ברור, ו-Q5 (תיקון תיוג מצב-רוח) בכוונה לא נכנס אוטומטית ל-mapping
    table המשותפת מכל תשובת משתמש בודדת (בדיוק כמו שההחלטה על seed
    override, §4 החלטה #6, נעשתה בעבודת נתונים ידנית ולא בכתיבה חיה).
    שני אלה מצטברים ל-`calibration_answers` לסקירה עתידית.
  - `getRotatingQuestionAnsweredCounts(gameId)` חדש — סופר תשובות לכל
    אחת מ-2–5 להזנת המשקלים ברוטציה.
- `src/components/sessionLog/CalibrationQuestion.tsx` — רכיב UI אחד
  שמציג את השאלה הנבחרת (chips, כמו הדפוס הקיים ב-Q1/MoodPicker).
  שאלה #5 היא דו-שלבית: כן/לא, וב"לא" נפתחת רשימת מצבי הרוח (`MOODS`).
- `src/app/session-log.tsx` — במקום "askCalibration: boolean" קבוע
  ל-Q1, טוען את הספירות מה-DB ובוחר שאלה בפועל דרך
  `pickCalibrationQuestionId`, עדיין רק אחרי שהשער הכללי
  (`shouldAskCalibrationQuestion`) אישר לשאול בכלל.
- `src/i18n/en.ts` — `sessionLog.calibrationQuestion`/`calibrationOptions`
  (Q1 בלבד) הפכו ל-`calibrationQuestions[1..5]` עם שאלה+אופציות לכל אחת.

**נבדק:** typecheck + lint + 99 טסטים (93 היו, +6 חדשים) + `expo export`
לשתי הפלטפורמות — כולם עברו. **לא נבדק בפועל על מכשיר** (הסביבה הזו
remote/headless) — הצעד הבא בפועל: לשחק כמה סשנים אמיתיים על משחק
לא-מכויל ולוודא שהשאלות מתחלפות (לא תמיד אותה שאלה), ושהתשובות
משפיעות בהדרגה על `typicalSessionMinutes`/`interruptible` במסך המשחק.

---

## 12. Timer notification אמיתי — הושלם

פריט #1 מ-§9 (הישן). מסך האישור (§3.4) הזהיר עד עכשיו רק בטקסט על
המסך ("Time's up") — אם המשתמש עבר למסך אחר או נעל את הטלפון, לא
היה שום תזכורת. עכשיו יש התראה מקומית מתוזמנת ברמת המערכת:

- **`expo-notifications`** (`~57.0.17`, תואם ל-Expo SDK 57) — נוסף
  ל-dependencies + plugin ב-`app.json` (אייקון/צבע לאנדרואיד).
  **זו מודעה מקומית מתוזמנת (`scheduleNotificationAsync` עם
  `SchedulableTriggerInputTypes.DATE`), לא push מרוחק** — אין שרת,
  אין טוקן, אין תלות ב-Supabase. בדיוק כמו ש-§9 (הישן) ביקש: "התראה
  עדינה בסוף" ולא באמת push notification ממרכז שליטה.
- `src/lib/sessionTimer/notifications.ts` — עוטף את ה-API: מבקש
  הרשאה רק כשבאמת מתחילים טיימר (לא ב-onboarding, לא נדחף על
  המשתמש מוקדם מדי), `scheduleSessionEndNotification`/
  `cancelSessionEndNotification`. **כשל בהרשאה או ב-API מוחזר כ-`null`
  ונבלע בשקט** — התראה היא שיפור, לא תלות: אם היא נכשלת, מסך האישור
  ממשיך לעבוד בדיוק כמו קודם עם ה-countdown הטקסטואלי.
- `src/app/session-confirm.tsx` — `handleStart` מתזמן התראה ל-
  `now + totalMinutes` עם שם המשחק; `goToLog` ("סיימתי לשחק") מבטל
  אותה; יש גם `useEffect` cleanup שמבטל אם עוזבים את המסך בלי
  ללחוץ "סיימתי" (back וכו') — לא רוצים התראה יתומה על סשן שכבר לא
  במעקב.
- טקסט חדש: `t.sessionConfirm.notificationTitle`/`notificationBody`.

**מגבלה ידועה, לא נבדקה בפועל:** זהו native module. הסביבה כאן
remote/headless, ואין עדיין Development Build (§2 — מתוכנן משלב 4,
RevenueCat). **יכול להיות שההתראה לא תעבוד ב-Expo Go** (מ-SDK 53
Expo Go לא תומך יותר ב-remote push, אבל התראות מקומיות בדרך כלל
כן — לא אומת). **הצעד הבא בפועל:** להריץ `npx expo start`, לסרוק,
להתחיל סשן, לעבור לרקע/לנעול את הטלפון, ולוודא שההתראה מגיעה. אם
לא עובד ב-Expo Go — התכונה תעבוד ברגע שיש Development Build (שלב 4
ממילא בתוכנית).

**נבדק:** typecheck (מלבד `global.css` הידוע, ראה §5) + lint +
99 טסטים (ללא שינוי — זו תוספת I/O, לא לוגיקה טהורה, אין טסט יחידה
חדש) + `expo export` לשתי הפלטפורמות — כולם עברו.

---

## 15. "זמן להשלמה" (HLTB) — הושלם, לא נבדק מול נתוני אמת

פריט #2 מ-§9 (הישן). המשתמש בחר במפורש: HowLongToBeat לא-רשמי (אין
API רשמי — ראה SPEC §7, שם ההחלטה המקורית הייתה להסיר את HLTB
לגמרי מהמוצר הליבה בגלל זה; כאן זה רק תצוגה נלווית ב-§3.6/§3.7,
**לא** נכנס ל-sessionFit או למנוע ההמלצה, אז חוסר יציבות ב-API לא
פוגע בליבה).

- `tools/igdb-proxy/hltb.ts` — `searchHltb(query)`. אין endpoint רשמי:
  הפונקציה שולפת את דף הבית של howlongtobeat.com, מאתרת את חבילת ה-JS
  שלהם (`_next/static/chunks/pages/_app-*.js`), ומחלצת ממנה את נתיב
  ה-API (בנוי מ-string concatenation כדי להקשות על scraping — משתנה
  מדי כמה חודשים, בדיוק כמו שספריות קהילתיות כמו `howlongtobeat.py`
  ו-`node-hltb` עושות). מטמון של שעה על הנתיב שחולץ; כישלון (502/שינוי
  API) מנקה את המטמון לניסיון הבא. תואם לצורת הנתונים המתועדת של ה-API
  הזה (`comp_main`/`comp_plus`/`comp_100` בשעות עשרוניות).
- `tools/igdb-proxy/server.ts` — נתיב חדש `/hltb/search?q=`, על אותו
  שרת/פורט (8787) כמו IGDB/Steam, אותו דפוס `sendJson`/try-catch-502.
- `src/lib/hltb/` — gateway בצד הקליינט, אותו דפוס בדיוק כמו
  `src/lib/igdb/`/`src/lib/steam/` (mock בלי פרוקסי דרך
  `EXPO_PUBLIC_IGDB_PROXY_URL` המשותף, http מולו, `getHltbGateway()`
  כנקודת כניסה יחידה). `formatHours.ts` — פונקציה טהורה שהופכת דקות
  לתווית שעות ("22h" / "1.5h") לתצוגה. טסטים ב-`hltb.test.ts`.
- **סכימה** (`src/db/schema/catalog.ts`) — 4 עמודות חדשות ב-`games`:
  `hltb_main_story_minutes`/`hltb_main_extra_minutes`/
  `hltb_completionist_minutes` (דקות, nullable) ו-`hltb_looked_up_at`
  (timestamp, nullable — מסמן שניסיון קרה, גם אם לא נמצאה התאמה, כדי
  לא לשלוח בקשה חוזרת על כל טעינה). מיגרציה `drizzle/0001_majestic_emma_frost.sql`
  (נוצרה עם `npm run db:generate`, שדרש `npm install` תחילה — `drizzle-kit`
  לא היה מותקן בסביבה הזו).
- `src/db/repositories/hltbRepo.ts` — `enrichGameWithHltb(gameId, name)`:
  best-effort, **בלי await מה-caller**, בולעת כל שגיאה בשקט (בדיוק כמו
  ש-§4.3 "אל תיתקע פה" אומר לגבי Steam) — כישלון החיפוש אף פעם לא
  אמור לעכב הוספת משחק. נקראת מ-`addManualGame`/`addGameFromIgdb`
  ב-`gamesRepo.ts`. **בכוונה לא מחוברת לייבוא Steam ההמוני**
  (`steamImportRepo.ts`) — אותה סיבה שכבר תועדה שם לגבי העשרת IGDB:
  מאות משחקים בבת אחת מול API לא-רשמי ולא-מהיר זה לא נכון. שיפור
  עתידי אפשרי (העשרה עצלה בפתיחת מסך המשחק) — ל-IDEAS.md, לא נבנה.
- **תצוגה:** `game/[id].tsx` — בלוק "Time to beat" (Main Story /
  Main + Extras / Completionist), מוצג רק כשיש לפחות נתון אחד.
  `src/lib/library/filterSort.ts` — אופציית מיון חדשה `completionTime`
  (הכי קצר קודם, ללא-נתון בסוף), `LibraryFilters.tsx`/`library.tsx`
  מחוברים.

**לא נבדק מול HLTB אמיתי — חסימת רשת בסביבה הזו:** ניסיון `curl` ל-
`howlongtobeat.com` מהסביבה המרוחקת הזו נחסם ברמת ה-proxy הארגוני
(`connect_rejected`, מדיניות ארגונית). **המשמעות: החילוץ הדינמי של
נתיב ה-API (§ למעלה) לא אומת בפועל בכלל, לא רק ה"מכשיר" — זה בדיוק
המקרה שכלל #8 מזהיר מפניו, אבל אין דרך לעמוד בו כאן.** הצעד הבא
בפועל **קריטי, לא רק "נחמד לבדוק"**: להריץ `npm run dev` ולחפש דרך
`http://localhost:8787/hltb/search?q=hades` (או מ-Postman/דפדפן).
אם זה מחזיר 502 — סימן שה-regex בחילוץ הנתיב השתנה, וצריך לפתוח
את `https://howlongtobeat.com` ידנית ב-DevTools → Network → לראות
לאיזה `/api/search/...` הדפדפן קורא בפועל בחיפוש אמיתי, ולעדכן את
ה-regex/הפרסינג ב-`tools/igdb-proxy/hltb.ts` בהתאם. עד אז, הפיצ'ר
נופל בחזרה בשקט ל"אין נתון" (`hltbLookedUpAt` נכתב, שאר השדות
null) — לא קורס, פשוט לא מציג כלום.

**נבדק:** typecheck (מלבד `global.css` הידוע) + lint + 107 טסטים
(99 היו, +8 חדשים ל-HLTB, +1 למיון) + `expo export` לשתי הפלטפורמות —
כולם עברו. **המימוש עצמו — מוק בלבד, לא מול HLTB חי**, ראה למעלה.

---

## 16. Supabase Auth + Sync (§8 שלב 4) — הושלם, לא אומת מול פרויקט אמיתי

פריט #5 מ-§9. המשתמש בחר במפורש להתחיל שלב 4 מ-Auth+sync, לפני
RevenueCat/PostHog (עדיין לא נבנו — §9 פריט #6).

**Scope שהוחלט בכוונה, אל תפתח מחדש בלי סיבה:** זה **גיבוי/שחזור
אישי בין מכשירים של אותו משתמש**, **לא** הקטלוג המשותף-רב-משתמשים
ש-SPEC §6 מתאר לטווח ארוך (איפה `typical_session_minutes` אמור
להצטבר מכל המשתמשים בעולם, לא רק מכשיר אחד של משתמש אחד). לבנות את
זה זה פיצ'ר נפרד, גדול משמעותית (aggregation חוצה-משתמשים, טבלת
games שהיא באמת משותפת) — לא ב-scope כאן, ל-IDEAS.md אם רוצים
בעתיד.

- **Auth** — magic code באימייל (OTP), לא סיסמה: §2 ב-AGENTS.md אומר
  שהמשתמש עובד בעיקר מהטלפון בלי טרמינל, אז "קוד באימייל" הוא הזרימה
  הכי פשוטה שם, בלי לנהל סיסמאות. `src/lib/supabase/auth.ts` —
  `requestSignInCode`/`verifySignInCode`/`signOut`/`getCurrentSession`/
  `onAuthStateChange`, עוטפים `@supabase/supabase-js` ישירות (לא
  פרוקסי כמו IGDB/Steam — ה-anon key מיועד להיות ציבורי, ה-RLS
  בפרויקט Supabase הוא ההגנה). `src/lib/supabase/client.ts` — session
  נשמר ב-`@react-native-async-storage/async-storage` (לא SecureStore
  — ה-JWT/refresh token גדולים מ-2KB, המגבלה של SecureStore; זה
  הדפוס הרשמי המומלץ ע"י Supabase ל-RN/Expo).
- **אופציונלי לגמרי, לא onboarding חוסם** — `isSupabaseConfigured()`
  (`src/lib/supabase/config.ts`, בודק `EXPO_PUBLIC_SUPABASE_URL`/
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`) קובע אם `SyncSection` (בהגדרות)
  בכלל מוצג. ריק = האפליקציה ממשיכה בדיוק כמו לפני שלב 4, בלי לגעת
  ברשת בכלל — AGENTS.md כלל 4 ("SQLite הוא מקור האמת").
- **סכימה מקומית** — עמודת `updated_at` חדשה ב-`users` וב-`user_games`
  (מיגרציה `drizzle/0002_odd_squadron_sinister.sql`), מתעדכנת בכל
  UPDATE בפועל (`swipeRepo`/`steamImportRepo`/`sessionsRepo`) — זה
  הבסיס ל-last-write-wins. `sessions`/`calibration_answers` הם
  write-once, אז `ended_at`/`answered_at` הקיימים כבר מספיקים (אין
  להם `updated_at` נפרד).
- **מיפוי (`src/lib/sync/mapping.ts`, + טסטים)** — פונקציות טהורות
  camelCase↔snake_case בין שורת SQLite מקומית לשורה מרוחקת. `userId`
  המקומי הוא **תמיד** `LOCAL_USER_ID` הקבוע (`local-user`) — לא נוגעים
  בו; ה-`auth.uid()` האמיתי נכנס רק ל-`user_id` המרוחק. ה-`id` של כל
  שורה (user_games/sessions/calibration_answers) נשאר זהה מקומית
  ומרוחקת — בלי טבלת מיפוי id נפרדת.
- **פתרון קונפליקטים (`src/lib/sync/resolveConflict.ts`, + טסטים)** —
  `shouldApplyRemote` (LWW לפי `updated_at`, לטבלאות שניתן לעדכן) ו-
  `findMissingRemoteIds` (לטבלאות write-once — פשוט "מה עוד לא קיים
  מקומית").
- **אורקסטרציה (לא נבדק ביחידה, כמו כל repo אחר בפרויקט)** —
  `src/db/repositories/syncPushRepo.ts` (push: profile → games
  שהמשתמש מחזיק → user_games → sessions → calibration_answers, כל
  שלב best-effort בנפרד) ו-`syncPullRepo.ts` (pull: אותו סדר הפוך,
  עם שמירה על FK — לא מכניס session/calibration_answer שמצביע על
  game_id שלא קיים מקומית). `syncRepo.ts.syncNow()` היא נקודת הכניסה
  היחידה: push לפני pull בכוונה (כדי שה-LWW לא "יפסיד" לגרסה מקומית
  ישנה יותר שכבר הייתה ב-Supabase), עוטף הכל ב-try/catch — כישלון
  רשת לא הורס נתונים מקומיים, ה-DB המקומי נשאר תקין.
- **`games` המרוחק הוא cache לקריאה בלבד, לא shared-write** — RLS
  מרשה insert (עם `ignoreDuplicates: true` מה-client, כלומר "רק אם
  עוד לא קיים") אבל **בלי policy ל-UPDATE בכלל**. המשמעות: כשמשתמש
  מכייל משחק (typicalSessionMinutes משתנה מקומית), העדכון **לא**
  מתפשט למכשיר השני עד שהמשחק נמחק ונוצר מחדש — זו מגבלה מכוונת של
  ה-scope הזה (ראה למעלה), לא באג.
- **UI** — `src/components/settings/SyncSection.tsx`, מוצג במסך
  ההגדרות. לא מחובר → טופס אימייל+קוד. מחובר → "Sync now" + "Sign
  out" + "סונכרן לאחרונה...". `src/i18n/en.ts` — `t.sync.*`.
- **`supabase/migrations/0001_sync_tables.sql`** — SQL גולמי (לא
  Drizzle, לא CLI מקושר) ליצירת `profiles`/`games`/`user_games`/
  `sessions`/`calibration_answers` + כל ה-RLS policies בפרויקט
  Supabase. **המשתמש חייב להריץ את זה ידנית** (Supabase Dashboard →
  SQL Editor → הדבקה והרצה) אחרי יצירת פרויקט חדש.

**לא אומת בכלל מול Supabase אמיתי — אין עדיין פרויקט קיים.** בניגוד
ל-HLTB (שנחסם ע"י מדיניות רשת), כאן הבעיה שונה: אין credentials בכלל
עדיין ליצור. **הצעד הבא בפועל, קריטי לפני שסומכים על זה:**
1. ליצור פרויקט חדש ב-supabase.com (חינמי).
2. Authentication → Providers → לוודא ש-Email OTP מופעל (מופעל
   כברירת מחדל, אבל שווה לוודא ש"Confirm email" לא דורש redirect
   URL שלא קיים לאפליקציית מובייל — לבדוק את Email Templates אם הקוד
   לא מגיע).
3. SQL Editor → להדביק ולהריץ את `supabase/migrations/0001_sync_tables.sql`.
4. Project Settings → API → להעתיק את ה-URL וה-anon key ל-`.env`
   (`EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`).
5. `npx expo start`, להיכנס להגדרות, להזין אימייל אמיתי, לוודא שקוד
   מגיע (לבדוק תיקיית ספאם), להזין קוד, ולבדוק "Sync now" לא זורק
   שגיאה.
6. **הבדיקה האמיתית:** להוסיף משחק/לשחק סשן במכשיר אחד, לסנכרן, ואז
   על מכשיר/התקנה שנייה (אמולטור נוסף או מחיקת האפליקציה והתקנה
   מחדש) להתחבר לאותו אימייל ולוודא שהספרייה/ההיסטוריה מופיעות.

**נבדק:** typecheck (מלבד `global.css` הידוע) + lint + 118 טסטים
(107 היו, +11 חדשים ל-mapping/resolveConflict) + `expo export`
לשלוש הפלטפורמות (android/ios/web — web כי `vercel-build` תלוי בו) —
כולם עברו. **המימוש עצמו לא נבדק מול Supabase חי בכלל**, ראה למעלה.

---

## 10. בדיקות לפני שמכריזים "עובד"

```bash
npm run typecheck   # אפליקציה + כלים. חייב exit 0 (מלבד global.css, ראה §8)
npm test            # 118 טסטים
npx expo export --platform android
npx expo export --platform ios
```

ואז הרצה בפועל על הטלפון (`npx expo start` + סריקת QR) — במיוחד
לפני שמכריזים על ייבוא Steam "עובד": הבדיקות למעלה לא נוגעות ב-Steam
API האמיתי.

---

## 13. רשימה מרוכזת — מה לבדוק במכשיר אמיתי

הסביבות שבהן פותח הפרויקט עד כה (הן ה-Windows של המשתמש, הן הסשנים
המרוחקים/headless של Claude Code) **לא הריצו את האפליקציה בפועל על
טלפון** בשום שלב. כל הפריטים למטה נבדקו רק ב-typecheck/lint/vitest/
`expo export` — כלומר "מתקמפל ועובר טסטים", לא "עובד ביד". זו רשימה
מרוכזת של כל מה שנשאר פתוח מכל הסשנים עד עכשיו, כדי שבדיקה אחת על
המכשיר תכסה את כולם:

1. **התראת סוף-סשן (§12, חדש בסשן הזה)** — הכי קריטי לבדוק, כי יש
   סיכוי שהיא לא עובדת בכלל ב-Expo Go: תתחיל סשן ממסך האישור, תעביר
   את האפליקציה לרקע או תנעל את הטלפון, ותוודא שההתראה מגיעה בזמן.
   אם היא לא מגיעה ב-Expo Go — זו לא בהכרח באג, ראה את ההערה על
   Development Build ב-§12 לפני שפותחים חקירה.
2. **ייבוא Steam עם `STEAM_API_KEY` אמיתי (§7, §9)** — צריך `.env`
   עם מפתח אמיתי (`tools/igdb-proxy`), ואז ממסך ההגדרות/empty-state:
   הזנת Steam ID/שם פרופיל, ייבוא בפועל, ולוודא שהמשחקים מופיעים
   בספרייה עם `hoursPlayed` נכון, וש-resync חוזר לא יוצר כפילויות.
3. **מחוות ה-Swipe מרגישות מיידיות (§3.3 ב-SPEC, §8 הישן)** — Reanimated
   על מחסנית 3 כרטיסים: ימינה/שמאלה/למעלה/tap, בלי עיכוב או קפיצה
   ויזואלית. זה בדיוק המסך שה-SPEC אוסר עליו "תחושת טעינה" — הכי
   חשוב לבדוק ביד, לא רק שהוא מתקמפל.
4. **טיימר הסשן מרגיש חי + הלוג המהיר נשמר (§8 הישן, שלב 3)** — מסך
   האישור, ה-countdown, "איפה עצרתי", ואז שה-`game/[id]` מציג את
   הסשן/ההערה החדשים מיד אחרי השמירה.
5. **שאלות הכיול 2–5 מתחלפות בפועל (§11)** — לשחק כמה סשנים אמיתיים
   על משחק לא-מכויל (פחות מ-15 דיווחים), לוודא שלא תמיד אותה שאלה
   חוזרת, ושהתשובות משפיעות בהדרגה על `typicalSessionMinutes`/
   `interruptible` שמוצגים במסך המשחק.
6. **בדיקת שפיות כללית** — האפליקציה עולה בלי קריסה על מכשיר אמיתי
   (לא רק על `expo export`), ניווט בין כל המסכים, ומצב כהה (§theme)
   נראה תקין בפועל (לא רק ב-`Appearance.setColorScheme` שרץ ב-headless).
7. **"זמן להשלמה" מול HLTB חי (§15, חדש בסשן הזה)** — **הכי דחוף
   מהרשימה**, כי לא אומת בכלל (לא רק "לא במכשיר" — הסביבה המרוחקת
   הזו חסומה מגישה לאינטרנט ל-howlongtobeat.com). עם `npm run dev`
   רץ, פתח `http://localhost:8787/hltb/search?q=hades` בדפדפן. אם
   זה מחזיר נתונים → הוסף משחק (ידני או IGDB) ובדוק שה"Time to beat"
   מופיע ב-`game/[id]` תוך כמה שניות. אם זה מחזיר 502 → ה-API
   הלא-רשמי של HLTB השתנה; ראה §15 להוראות תיקון (בדיקת
   Network tab ב-DevTools מול החיפוש האמיתי באתר).
8. **Supabase Auth + Sync (§16, חדש בסשן הזה) — לא אומת בכלל, אין
   עדיין פרויקט Supabase קיים.** דורש: יצירת פרויקט, הרצת המיגרציה
   הידנית (`supabase/migrations/0001_sync_tables.sql`), מילוי `.env`,
   ואז מ-2 מכשירים/התקנות: להתחבר לאותו אימייל, לוודא שקוד ה-OTP
   מגיע, ושספרייה/היסטוריה שנוספו במכשיר אחד מופיעות בשני אחרי
   "Sync now". §16 להוראות המלאות, שלב-שלב.

---

## 14. פרומפט להעברה לסוכן הבא

```
תמשיך את פיתוח PlayNight.

קודם תקרא לפי הסדר:
1. PLAYNIGHT_SPEC.md (האפיון המלא)
2. HANDOFF.md (מצב נוכחי, החלטות, מלכודות) — במיוחד §9 (מה נשאר
   פתוח), §16 (Supabase Auth+sync, חדש — לא אומת מול פרויקט אמיתי
   בכלל, אין עדיין פרויקט קיים), §15 (HLTB — עדיין לא אומת, חסימת
   רשת) ו-§13 (רשימה מרוכזת של כל מה שצריך לבדוק במכשיר אמיתי, כולל
   §16 כפריט #8 עכשיו)
3. AGENTS.md (כללי עבודה קבועים)

מצב נוכחי: שלבים 1-3 הושלמו במלואם. שלב 4 (§8 SPEC) התחיל: Auth+sync
מול Supabase (§16) הושלם בקוד, RevenueCat/PostHog עדיין לא נגעו בהם
כלל. typecheck + lint + 118 טסטים + expo export (android/ios/web)
עוברים. שום דבר מהרשימה ב-§13 עוד לא נבדק בפועל.

מה שנשאר פתוח (HANDOFF.md §9):
1. **Supabase Auth+sync (§16) לא אומת בכלל — אין עדיין פרויקט
   Supabase קיים**, לא רק "לא נבדק". §16 נותן הוראות שלב-שלב ליצור
   פרויקט, להריץ את `supabase/migrations/0001_sync_tables.sql`
   (SQL גולמי, ידני — אין CLI מקושר), למלא `.env`, ולבדוק סנכרון
   אמיתי בין 2 מכשירים/התקנות. **תעדוף את זה** אם יש לך גישה ליצור
   פרויקט Supabase (למשל אם המשתמש נתן credentials) — אחרת זה מחכה
   לדיווח מהמשתמש בדיוק כמו §13.
2. **HLTB (§15) עדיין לא אומת מול נתוני אמת** — הסביבה המרוחקת
   חסומה מגישה ל-howlongtobeat.com (org policy). נבדק שוב בסשן הזה,
   עדיין חסום. אם `http://localhost:8787/hltb/search?q=hades` מחזיר
   502, ראה §15 להוראות תיקון.
3. כל שאר סעיפי הרשימה ב-§13 — דורשים שהמשתמש ירוץ את זה בעצמו על
   הטלפון. אם הוא מדווח על תוצאה של אחד מהם (עבד/לא עבד/באג ספציפי)
   — תתקן לפי הדיווח, אל תנחש בלי דיווח.
4. RevenueCat + PostHog (שאר §8 שלב 4) — לא התחלנו. לשאול את המשתמש
   באיזה סדר לפני שמתחילים (בדיוק כמו שנשאל על Auth+sync מול השאר
   בתחילת הסשן הזה) — RevenueCat דורש Development Build שהמשתמש בונה
   בעצמו על ה-Mac (§2 AGENTS.md), אז יש שם תלות דומה לזו של Steam/HLTB.

לפני שמתחילים בפיצ'ר: הרץ npm install, npm run typecheck, npm test —
ודא שהכל ירוק כמו שהיה בסוף הסשן הקודם (typecheck נכשל רק על
global.css הידוע — לא קשור, ראה HANDOFF.md §7/§5).

כללי git: branch חדש, PR בסוף (draft), אחרי הפתיחה שלח לי את קישור
ה-Vercel deployment לבדיקה, ואחרי אישור למזג ל-main — לפי CLAUDE.md.
תעדכן את HANDOFF.md בסוף העבודה כדי שהסוכן שאחריך יוכל להמשיך בלי
לנחש מה נעשה.
```
