/**
 * Cryptographically secure float in [0, 1). `Math.random` is predictable
 * enough that it should not decide who wins a prize.
 */
export declare function secureRandom(): number;
/**
 * Returns the entries in a random order where every entry is equally likely
 * to land in any position (Fisher-Yates). The input is not modified.
 */
export declare function shuffle<T>(items: readonly T[]): T[];
/**
 * Orders entries for a weighted draw without replacement
 * (Efraimidis and Spirakis, "Weighted random sampling with a reservoir", 2006).
 * Each entry gets the key u^(1/w); sorting by key descending yields an order in
 * which taking the first k is a weighted sample of size k. Walking further down
 * the list gives fallbacks when a drawn entry turns out to be ineligible.
 *
 * Entries whose weight is not a positive finite number get weight 1.
 */
export declare function weightedOrder<T>(items: readonly T[], weight: (item: T) => number): T[];
//# sourceMappingURL=random.d.ts.map