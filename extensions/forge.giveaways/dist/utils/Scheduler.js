"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = exports.MAX_TIMER_DELAY = void 0;
/**
 * Largest delay Node accepts for a single timer (2^31 - 1 ms, about 24.8 days).
 * Anything above this silently overflows to 1 ms, which is what made long
 * giveaways end immediately in the original extension.
 */
exports.MAX_TIMER_DELAY = 2 ** 31 - 1;
/**
 * A single-timer deadline scheduler with no upper bound on how far in the
 * future a deadline may be.
 *
 * Instead of one `setTimeout` per giveaway, it keeps every deadline in a map
 * and arms exactly one timer for the earliest one. Delays longer than
 * {@link MAX_TIMER_DELAY} are split: the timer wakes up early, sees nothing
 * is due yet and re-arms for the remainder. Waking up also corrects for clock
 * drift, so deadlines are honoured even after the host sleeps.
 */
class Scheduler {
    callback;
    #deadlines = new Map();
    #timer = null;
    #armedFor = Infinity;
    #running = false;
    constructor(callback) {
        this.callback = callback;
    }
    /** Number of pending deadlines. */
    get size() {
        return this.#deadlines.size;
    }
    /** Returns the deadline of a key, if scheduled. */
    get(key) {
        return this.#deadlines.get(key);
    }
    has(key) {
        return this.#deadlines.has(key);
    }
    /**
     * Schedules (or reschedules) a key to fire at an absolute timestamp.
     * Timestamps in the past fire on the next tick.
     */
    schedule(key, at) {
        if (!Number.isFinite(at))
            throw new RangeError(`Invalid deadline for "${key}": ${at}`);
        this.#deadlines.set(key, at);
        if (at < this.#armedFor)
            this.#arm();
    }
    /** Removes a pending deadline. */
    cancel(key) {
        const existed = this.#deadlines.delete(key);
        if (existed && !this.#deadlines.size)
            this.#disarm();
        return existed;
    }
    /** Cancels every pending deadline and stops the timer. */
    clear() {
        this.#deadlines.clear();
        this.#disarm();
    }
    #disarm() {
        if (this.#timer)
            clearTimeout(this.#timer);
        this.#timer = null;
        this.#armedFor = Infinity;
    }
    #arm() {
        this.#disarm();
        if (!this.#deadlines.size)
            return;
        let next = Infinity;
        for (const at of this.#deadlines.values())
            if (at < next)
                next = at;
        const delay = Math.min(Math.max(next - Date.now(), 0), exports.MAX_TIMER_DELAY);
        this.#armedFor = next;
        this.#timer = setTimeout(() => this.#tick(), delay);
        this.#timer.unref?.();
    }
    #tick() {
        this.#timer = null;
        this.#armedFor = Infinity;
        if (this.#running)
            return this.#arm();
        this.#running = true;
        try {
            const now = Date.now();
            const due = [];
            for (const [key, at] of this.#deadlines)
                if (at <= now)
                    due.push(key);
            for (const key of due) {
                this.#deadlines.delete(key);
                try {
                    const res = this.callback(key);
                    if (res instanceof Promise)
                        res.catch(() => { });
                }
                catch {
                    // A failing callback must never stop the other deadlines.
                }
            }
        }
        finally {
            this.#running = false;
            this.#arm();
        }
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=Scheduler.js.map