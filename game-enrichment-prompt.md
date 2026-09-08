# פרומפט להעשרת קטלוג משחקים — Playnight

איך להשתמש: פתח שיחת Claude חדשה (או Claude.ai) והדבק את כל מה שבין הקווים המפרידים. ה-JSON שיחזור, שמור כקובץ ותן לי (ל-Claude בפרויקט) לייבא אותו לקוד/ל-seed.

אפשר להריץ את זה כמה פעמים עם רשימות משחקים שונות — פשוט מחליפים את הרשימה בסעיף "המשחקים לבדיקה" בתחתית.

---

אתה עוזר מחקר למאגר משחקים של אפליקציה בשם Playnight. האפליקציה מציעה למשתמש משחק בהתאם לזמן הפנוי שיש לו הערב, ולכן הנתונים החשובים ביותר הם לא רק "מה המשחק" אלא "איך משחקים בו מבחינת מבנה זמן".

עבור **כל משחק** ברשימה בסוף הפרומפט, חפש באינטרנט מידע אמין (Wikipedia, IGDB, Steam store page, Metacritic, ביקורות מוכרות) ובנה רשומת JSON עם השדות הבאים בדיוק:

```json
{
  "name": "string — השם הרשמי המלא של המשחק",
  "igdbId": "number | null — מזהה IGDB אם אתה יודע אותו בוודאות, אחרת null",
  "releaseYear": "number | null — שנת היציאה הראשונה (המקורית, לא רימאסטר)",
  "genres": ["array of strings — ז'אנרים סטנדרטיים, למשל: Action, RPG, Shooter, Platformer, Strategy, Simulation, Puzzle, Adventure, Sports, Racing"],
  "platforms": ["array of strings — פלטפורמות עיקריות שהמשחק יצא עליהן, למשל: PC, PlayStation, Xbox, Switch"],
  "communityRating": "number | null — ציון Metacritic (סולם 0-100) אם קיים, אחרת ציון Steam/OpenCritic מנורמל ל-0-100. ציין את המקור בשדה ratingSource",
  "ratingSource": "string | null — 'Metacritic' / 'Steam' / 'OpenCritic' / וכו׳",
  "archetype": "string | null — אחד מהערכים הקבועים ברשימה למטה, או null אם אף אחד לא מתאים באמת",
  "typicalSessionMinutes": "number — הערכה: כמה זמן משחק טיפוסי (סיבוב/מפגש) אורך בפועל, לא כמה זמן לוקח לסיים את המשחק",
  "interruptible": "boolean — true אם אפשר לעצור כמעט בכל רגע בלי לאבד התקדמות/להפריע לחוויה (למשל אמצע מאץ' תחרותי = false)",
  "confidence": "'high' | 'medium' — עד כמה אתה בטוח בנתונים. אם הביטחון נמוך מ-medium — אל תכלול את המשחק בכלל, הוסף אותו לרשימת ה-unresolved בסוף"
}
```

## רשימת archetype קבועה (בחר אחד בדיוק, או null)

| archetype | מתי משתמשים בו | typicalMinutes ברירת מחדל | interruptible ברירת מחדל |
|---|---|---|---|
| roguelike | ריצות קצרות שמתחילות מחדש (Hades, Dead Cells) | 15 | true |
| battleRoyale | מאץ' תחרותי גדול (PUBG, Apex, Fortnite) | 25 | false |
| moba | Dota/LoL וכו׳ | 30 | false |
| openWorldSandbox | עולם פתוח בלי עלילה כובלת, אפשר לצאת מתי שרוצים (GTA sandbox-style, Minecraft) | 20 | true |
| openWorldStory | עולם פתוח עם עלילה מרכזית (Witcher 3, GTA V story) | 40 | false |
| turnBasedStrategy | אסטרטגיה מבוססת תורות (Civilization, XCOM) | 60 | false |
| jrpg | RPG יפני עם עלילה וקרבות מובנים | 45 | false |
| puzzle | חידות (Portal) | 10 | true |
| visualNovel | סיפור מונחה טקסט/בחירות | 20 | true |
| narrative_linear | הרפתקה/אקשן ליניארי עם עלילה (The Last of Us, God of War) | 50 | false |
| simulation | סימולציה/בנייה נינוחה (The Sims, Stardew Valley) | 20 | true |
| arcadeSession | מאץ' קצר וסגור (Rocket League, Mario Kart, FIFA, Tekken) | 10 | true |

**חשוב:** לא כל משחק מתאים לרשימה הזו — במיוחד יורים תחרותיים/קלאסיים (למשל Half-Life, Call of Duty, Counter-Strike, Battlefield, Halo, Doom, Team Fortress 2) שהם לא roguelike ולא arcadeSession ולא battleRoyale. **אל תדחוף משחק לקטגוריה שלא מתאימה לו רק כדי למלא שדה.** אם שום archetype לא מתאים באמת — שים `archetype: null`, אבל עדיין תן הערכה ישירה וסבירה ל-`typicalSessionMinutes` ו-`interruptible` על סמך הבנתך את המשחק בפועל (למשל: יורה תחרותי מבוסס-מאץ' → בדרך כלל 20-30 דקות, לא ניתן להפרעה).

## כללי סינון — קרא בעיון

1. **אל תנחש.** אם אתה לא בטוח לגבי משחק — לא מזהה אותו, מוצא מידע סותר, או שאתה לא בטוח בציון/בשנה — **אל תכלול אותו ב-JSON בכלל**.
2. בסוף התשובה, תחת מפתח `"unresolved"`, תן מערך של שמות כל המשחקים מהרשימה שלא הצלחת להביא עליהם מידע אמין, עם משפט קצר למה (לא נמצא / מידע סותר / לא בטוח בז'אנר וכו׳).
3. אל תמציא igdbId — רק אם אתה יודע אותו בוודאות מ-IGDB עצמו. במקרה של ספק, שים null.

## פורמט הפלט הסופי

JSON יחיד עם שני מפתחות:

```json
{
  "games": [ /* מערך רשומות כמו למעלה */ ],
  "unresolved": [
    { "name": "שם המשחק", "reason": "הסיבה" }
  ]
}
```

בלי טקסט נוסף מסביב ל-JSON, בלי הסברים באמצע — רק ה-JSON עצמו (אפשר משפט פתיחה קצר לפני, ואז בלוק קוד עם ה-JSON).

---

## המשחקים לבדיקה

### קבוצה A — משחקים קיימים שחסר להם archetype (המערכת הפנימית לא הצליחה לסווג אותם)

Half-Life 2, Doom (1993), Max Payne, Call of Duty: Modern Warfare 2 (2009), Counter-Strike: Global Offensive, Call of Duty: Black Ops, Left 4 Dead 2, Battlefield 3, Call of Duty 2, Max Payne 2: The Fall of Max Payne, Doom (2016), Call of Duty: Black Ops II, Halo: Combat Evolved, Battlefield 1, Team Fortress 2, Half-Life 2: Episode One, Call of Duty (2003), Left 4 Dead, Doom Eternal, Counter-Strike (2000), Call of Duty: Ghosts, Star Wars: Battlefront II (2017), Metro: Last Light, Crash Bandicoot, Halo 2, Halo: Reach, Apex Legends, Call of Duty: Advanced Warfare, Sonic the Hedgehog, Call of Duty: WWII, PUBG: Battlegrounds, Sonic the Hedgehog 2, Donkey Kong Country, F.E.A.R.

### קבוצה B — משחקים חדשים להוספה למאגר (כרגע יש 300, המטרה להרחיב)

EA Sports FC 24, NBA 2K24, Forza Horizon 5, Gran Turismo 7, Mortal Kombat 11, Street Fighter 6, Tekken 8, Valorant, Rainbow Six Siege, Sea of Thieves, Rust, Palworld, Fall Guys, Deep Rock Galactic, Slay the Spire, Vampire Survivors, Hades II, Divinity: Original Sin 2, Persona 4 Golden, Yakuza 0, Cult of the Lamb, Hollow Knight: Silksong, Lethal Company, Helldivers 2, Marvel Rivals, Diablo IV, Path of Exile, Warframe, Sea of Stars, Octopath Traveler, Lies of P, Remnant II, Escape from Tarkov, XCOM 2, Total War: Warhammer III, Balatro, Inscryption, Risk of Rain 2, Split Fiction, Kingdom Come: Deliverance II, Black Myth: Wukong, Animal Crossing: New Horizons, Splatoon 3, Metroid Dread, Assassin's Creed Shadows, Overwatch 2, Human: Fall Flat, Factorio, Satisfactory, Valheim, Grounded, Sons of the Forest, Dave the Diver, Pizza Tower, Hi-Fi Rush, Cocoon, Chained Echoes, Frostpunk, Frostpunk 2, Two Point Hospital
