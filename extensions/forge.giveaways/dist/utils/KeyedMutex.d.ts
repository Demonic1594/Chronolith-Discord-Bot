/**
 * Serialises async work per key. Two operations on the same giveaway
 * (for example two people clicking "Join" at the same moment, or the end timer
 * racing a manual `$endGiveaway`) run one after another instead of both
 * reading stale state and overwriting each other's writes.
 */
export declare class KeyedMutex {
    #private;
    run<T>(key: string, fn: () => Promise<T> | T): Promise<T>;
    /** Whether any operation is queued or running for a key. */
    isLocked(key: string): boolean;
}
//# sourceMappingURL=KeyedMutex.d.ts.map