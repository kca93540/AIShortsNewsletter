export const RECENT_LIMIT = 5;

export type CardLike = { id: string };

export function selectNextCard(cards: CardLike[], recentIds: string[]): CardLike {
  if (cards.length === 0) {
    throw new Error("No cards available");
  }
  const recentSet = new Set(recentIds);
  const available = cards.filter((card) => !recentSet.has(card.id));
  const pool = available.length > 0 ? available : cards;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
