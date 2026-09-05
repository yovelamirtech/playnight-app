import { randomUUID } from 'expo-crypto';

/**
 * מזהי משחקים בקטלוג יציבים בין משתמשים כשהם מגיעים מ-IGDB,
 * כדי שנתוני הכיול (§4.5) יתאחדו סביב אותו משחק.
 */
export const igdbGameId = (igdbId: number): string => `igdb:${igdbId}`;

export const localGameId = (): string => `local:${randomUUID()}`;

export const newId = (): string => randomUUID();
