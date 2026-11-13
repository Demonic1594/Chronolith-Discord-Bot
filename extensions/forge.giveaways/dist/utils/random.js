"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureRandom = secureRandom;
exports.shuffle = shuffle;
exports.weightedOrder = weightedOrder;
const crypto_1 = require("crypto");
/**
 * Cryptographically secure float in [0, 1). `Math.random` is predictable
 * enough that it should not decide who wins a prize.
 */
function secureRandom() {
    // randomInt allows a range below 2^48, which is plenty for a float.
    const RANGE = 2 ** 48 - 1;
    return (0, crypto_1.randomInt)(0, RANGE) / RANGE;
}
/**
 * Returns the entries in a random order where every entry is equally likely
 * to land in any position (Fisher-Yates). The input is not modified.
 */
function shuffle(items) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = (0, crypto_1.randomInt)(0, i + 1);
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
    }
    return out;
}
/**
 * Orders entries for a weighted draw without replacement
 * (Efraimidis and Spirakis, "Weighted random sampling with a reservoir", 2006).
 * Each entry gets the key u^(1/w); sorting by key descending yields an order in
 * which taking the first k is a weighted sample of size k. Walking further down
 * the list gives fallbacks when a drawn entry turns out to be ineligible.
 *
 * Entries whose weight is not a positive finite number get weight 1.
 */
function weightedOrder(items, weight) {
    const keyed = items.map((item) => {
        let w = weight(item);
        if (!Number.isFinite(w) || w <= 0)
            w = 1;
        // Work in log space: log(u)/w avoids underflow for large weights.
        const u = secureRandom() || Number.MIN_VALUE;
        return { item, key: Math.log(u) / w };
    });
    keyed.sort((a, b) => b.key - a.key);
    return keyed.map((x) => x.item);
}
//# sourceMappingURL=random.js.map