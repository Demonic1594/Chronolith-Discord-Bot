import { GuildMember, Message, Snowflake, User } from "discord.js";
import { ForgeClient } from "@tryforge/forgescript";
import { Giveaway, GiveawayDenyReason, IGiveawayBonusEntry, IGiveawayDisplay, IGiveawayRequirements, IGiveawayStartOptions, Renderer } from "../structures";
import { Scheduler } from "../utils";
import type { ForgeGiveaways } from "..";
import type { EntryContext } from "../handlers/GiveawaysEventHandler";
export type { IGiveawayStartOptions } from "../structures/Giveaway";
export interface IGiveawayEditOptions {
    prize?: string;
    winnersCount?: number;
    hostID?: Snowflake;
    requirements?: IGiveawayRequirements;
    bonusEntries?: IGiveawayBonusEntry[];
    maxEntries?: number | null;
    display?: IGiveawayDisplay;
}
export interface IEntryResult {
    action: "added" | "removed" | "denied";
    reason?: GiveawayDenyReason;
    giveaway: Giveaway;
}
/**
 * Owns the life cycle of every giveaway: start, end, reroll, edit, pause,
 * resume, extend, cancel and entries.
 *
 * - All state changes for a giveaway run through a per-giveaway lock, so
 *   concurrent clicks or a timer racing a manual end can't lose writes or
 *   announce winners twice.
 * - End times are tracked by a single {@link Scheduler}, which has no maximum
 *   duration (the original `setTimeout` per giveaway broke past ~24.8 days).
 * - Entry changes are batched into one database write per giveaway every
 *   `entryFlushDelay` ms, and the live entry counter on the message is
 *   refreshed at most every `messageUpdateDelay` ms.
 */
export declare class GiveawaysManager {
    #private;
    private readonly client;
    private readonly giveaways;
    readonly scheduler: Scheduler;
    readonly renderer: Renderer;
    constructor(client: ForgeClient, giveaways: ForgeGiveaways);
    private get messages();
    /** Resolves once the database is connected. */
    whenReady(): Promise<void>;
    /** @internal Called by the extension once the database is connected. */
    _onDatabaseReady(): void;
    private emit;
    private getChannel;
    /**
     * Fetches the message of a giveaway.
     * @param channelID The id of the channel to pull message from.
     * @param messageID The id of the message to fetch.
     */
    fetchMessage(channelID: Snowflake, messageID?: Snowflake | null): Promise<Message | undefined>;
    private getGuild;
    private clearTimers;
    /** Persists a giveaway now (inside its lock). */
    private save;
    /** Queues a coalesced write of entry changes. */
    private queueFlush;
    /** Queues a refresh of the giveaway message (live entry count). */
    private queueRefresh;
    /** Writes every pending entry change to the database. */
    flushAll(): Promise<void>;
    /** Re-renders the default giveaway message. */
    private updateMessage;
    private schedule;
    /**
     * Starts a new giveaway on a guild. There is no upper limit on the duration.
     * @param options The start options for the giveaway.
     */
    start(options: IGiveawayStartOptions): Promise<Giveaway | null>;
    /**
     * Links a custom start message to a giveaway (used by the `giveawayStart`
     * event when default messages are disabled).
     */
    attachMessage(id: Snowflake, messageID: Snowflake): Promise<Giveaway | null>;
    /** Removes a giveaway and its timers without announcing anything. */
    discard(id: Snowflake): Promise<import("typeorm").DeleteResult>;
    /**
     * Timer path for ending. If the bot is disconnected right at the deadline,
     * drawing now would find no members and end with no winners, so retry a
     * minute later instead. Manual `end()` calls are never postponed.
     */
    private _onDeadline;
    /**
     * Ends an existing giveaway and draws the winners.
     * @param id The id of the giveaway to end.
     */
    end(id: Snowflake): Promise<Giveaway | null>;
    /**
     * Cancels a running giveaway: it ends without winners.
     */
    cancel(id: Snowflake): Promise<Giveaway | null>;
    /**
     * Rerolls an ended giveaway.
     * @param id The id of the giveaway to reroll.
     * @param unique Whether everyone who already won is excluded.
     * @param amount The amount of new winners (defaults to the winners count).
     */
    reroll(id: Snowflake, unique?: boolean, amount?: number): Promise<Giveaway | null>;
    /**
     * Edits a running giveaway.
     * @param id The id of the giveaway to edit.
     * @param options The options used to edit this giveaway.
     */
    edit(id: Snowflake, options: IGiveawayEditOptions): Promise<Giveaway | null>;
    /**
     * Adds (or with a negative value removes) time from a running giveaway.
     * Shortening never moves the end before "now"; the giveaway then ends immediately.
     */
    extend(id: Snowflake, ms: number): Promise<Giveaway | null>;
    /** Pauses a running giveaway: the timer stops and nobody can join or leave. */
    pause(id: Snowflake): Promise<Giveaway | null>;
    /** Resumes a paused giveaway with the time it had left. */
    resume(id: Snowflake): Promise<Giveaway | null>;
    /**
     * Toggles a member's entry: joins if not entered, leaves otherwise.
     * Used by the button handler.
     */
    toggleEntry(id: Snowflake, member: GuildMember | Parameters<Giveaway["canEnter"]>[0], source: EntryContext, user: User): Promise<IEntryResult | null>;
    /** Adds a member's entry (used by reactions). */
    join(id: Snowflake, member: GuildMember, source: EntryContext, user: User): Promise<IEntryResult | null>;
    /**
     * Removes an entry. Returns the giveaway, or null if it was not entered/active.
     * @param force Also remove entries while paused or ended.
     */
    leave(id: Snowflake, userID: Snowflake, source?: EntryContext, user?: User, force?: boolean): Promise<Giveaway | null>;
    /**
     * Adds an entry on someone's behalf.
     * @param bypassRequirements Skip requirement checks (still respects ended state).
     */
    addEntry(id: Snowflake, userID: Snowflake, bypassRequirements?: boolean): Promise<Giveaway | null>;
    /**
     * Draws up to `count` winners. Candidates are put in a random order
     * (weighted by bonus entries) using a cryptographically secure RNG and then
     * checked one by one, so only as many members are fetched as needed instead
     * of every entrant, and people who left the server or no longer meet the
     * requirements are skipped.
     */
    private drawWinners;
    private fetchMembers;
    private announce;
    private dmWinners;
    /** @internal Restores timers for active giveaways after a restart. */
    _restore(): Promise<void>;
    /** Deletes giveaways that ended more than `olderThan` ms ago. Returns how many. */
    sweep(olderThan: number): Promise<number>;
    /** Stops all timers and writes pending changes. */
    destroy(): Promise<void>;
}
//# sourceMappingURL=GiveawaysManager.d.ts.map