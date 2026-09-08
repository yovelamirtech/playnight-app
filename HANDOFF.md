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

נשאר לשלב 3 (§8 ב-SPEC, "הלולאה"):

1. מסך אישור ("משחקים!") עם טיימר סשן + "איפה עצרתי" (§3.4).
2. מסך לוג מהיר אחרי סשן (§3.5).
3. **מנוע כיול** (§4.5) — שאלה #1 בלבד ל-MVP, סף 15 דיווחים.
4. הספרייה עם פילטרים/מיון (חלק מ-§3.6 עדיין שלד).

---

## 9. בדיקות לפני שמכריזים "עובד"

```bash
npm run typecheck   # אפליקציה + כלים. חייב exit 0
npm test            # 82 טסטים
npx expo export --platform android
npx expo export --platform ios
```

ואז הרצה בפועל על הטלפון (`npx expo start` + סריקת QR) — במיוחד
לפני שמכריזים על ייבוא Steam "עובד": הבדיקות למעלה לא נוגעות ב-Steam
API האמיתי.
