/** מחלקת ה-className המשותפת ל"פילים" נבחרים/לא-נבחרים (chips, tabs, filters). */
export function selectedPillClassName(selected: boolean): string {
  return selected ? 'border-accent bg-accent/20' : 'border-border bg-surface';
}
