"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyedMutex = void 0;
/**
 * Serialises async work per key. Two operations on the same giveaway
 * (for example two people clicking "Join" at the same moment, or the end timer
 * racing a manual `$endGiveaway`) run one after another instead of both
 * reading stale state and overwriting each other's writes.
 */
class KeyedMutex {
    #tails = new Map();
    run(key, fn) {
        const prev = this.#tails.get(key) ?? Promise.resolve();
        const result = prev.then(fn, fn);
        const tail = result.then(() => { }, () => { });
        this.#tails.set(key, tail);
        tail.then(() => {
            if (this.#tails.get(key) === tail)
                this.#tails.delete(key);
        });
        return result;
    }
    /** Whether any operation is queued or running for a key. */
    isLocked(key) {
        return this.#tails.has(key);
    }
}
exports.KeyedMutex = KeyedMutex;
//# sourceMappingURL=KeyedMutex.js.map