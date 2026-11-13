/**
 * Largest delay Node accepts for a single timer (2^31 - 1 ms, about 24.8 days).
 * Anything above this silently overflows to 1 ms, which is what made long
 * giveaways end immediately in the original extension.
 */
export declare const MAX_TIMER_DELAY: number;
export type SchedulerCallback = (key: string) => unknown;
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
export declare class Scheduler {
    #private;
    private readonly callback;
    constructor(callback: SchedulerCallback);
    /** Number of pending deadlines. */
    get size(): number;
    /** Returns the deadline of a key, if scheduled. */
    get(key: string): number | undefined;
    has(key: string): boolean;
    /**
     * Schedules (or reschedules) a key to fire at an absolute timestamp.
     * Timestamps in the past fire on the next tick.
     */
    schedule(key: string, at: number): void;
    /** Removes a pending deadline. */
    cancel(key: string): boolean;
    /** Cancels every pending deadline and stops the timer. */
    clear(): void;
}
//# sourceMappingURL=Scheduler.d.ts.map