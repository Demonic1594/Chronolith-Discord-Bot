/**
 * Serialises async work per key. Two operations on the same giveaway
 * (for example two people clicking "Join" at the same moment, or the end timer
 * racing a manual `$endGiveaway`) run one after another instead of both
 * reading stale state and overwriting each other's writes.
 */
export class KeyedMutex {
    readonly #tails = new Map<string, Promise<unknown>>()

    public run<T>(key: string, fn: () => Promise<T> | T): Promise<T> {
        const prev = this.#tails.get(key) ?? Promise.resolve()
        const result = prev.then(fn, fn)
        const tail = result.then(() => {}, () => {})
        this.#tails.set(key, tail)
        tail.then(() => {
            if (this.#tails.get(key) === tail) this.#tails.delete(key)
        })
        return result
    }

    /** Whether any operation is queued or running for a key. */
    public isLocked(key: string) {
        return this.#tails.has(key)
    }
}
