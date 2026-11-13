import { APIInteractionGuildMember, GuildMember, Snowflake } from "discord.js";
export type RequiredRolesMode = "all" | "any";
export interface IGiveawayRequirements {
    /** Roles a member must have (see {@link requiredRolesMode}). */
    requiredRoles?: Snowflake[];
    /** Whether members need `all` required roles (default) or `any` of them. */
    requiredRolesMode?: RequiredRolesMode;
    /** Members with any of these roles cannot enter. */
    restrictedRoles?: Snowflake[];
    /** These members cannot enter. */
    restrictedMembers?: Snowflake[];
    /** Minimum Discord account age in ms. */
    minAccountAge?: number;
    /** Minimum time in ms since the member joined the guild. */
    minMemberAge?: number;
}
export interface IGiveawayBonusEntry {
    /** The role granting the bonus. */
    roleID: Snowflake;
    /** Extra entries (tickets) members with this role get. */
    amount: number;
}
export interface IGiveawayDisplay {
    /** Extra text shown in the default giveaway embed. */
    description?: string;
    /** Embed color override (hex number). */
    color?: number;
    /** Large image URL for the default embed. */
    image?: string;
    /** Thumbnail URL for the default embed. */
    thumbnail?: string;
    /** Role pinged when the giveaway starts (default messages only). */
    pingRoleID?: Snowflake;
}
export interface IGiveawayStartOptions {
    prize: string;
    duration: number;
    winnersCount: number;
    hostID: Snowflake;
    guildID: Snowflake;
    channelID: Snowflake;
    requirements?: IGiveawayRequirements | null;
    bonusEntries?: IGiveawayBonusEntry[] | null;
    maxEntries?: number | null;
    display?: IGiveawayDisplay | null;
}
export interface IGiveaway extends IGiveawayStartOptions {
    id: Snowflake;
    timestamp: number;
    hasEnded: boolean;
    messageID?: Snowflake | null;
    entries: Snowflake[];
    winners: Snowflake[];
    previousWinners?: Snowflake[] | null;
}
/**
 * Why a member could not enter a giveaway. `null` means they can.
 */
export declare enum GiveawayDenyReason {
    MissingRoles = "missingRoles",
    RestrictedRole = "restrictedRole",
    RestrictedMember = "restrictedMember",
    AccountTooNew = "accountTooNew",
    MemberTooNew = "memberTooNew",
    EntriesFull = "entriesFull",
    Ended = "ended",
    Paused = "paused"
}
type AnyMember = GuildMember | APIInteractionGuildMember;
/**
 * A giveaway. This is a plain domain object: persistence mapping lives in
 * `schema.ts`, so the same class works for every database driver.
 */
export declare class Giveaway implements IGiveaway {
    /** The id of this giveaway. */
    id: Snowflake;
    /** The prize of this giveaway. */
    prize: string;
    /** The duration of this giveaway in ms (grows when paused or extended). */
    duration: number;
    /** The timestamp this giveaway has been created at. */
    timestamp: number;
    /** The max amount of winners for this giveaway. */
    winnersCount: number;
    /** Indicates whether this giveaway has ended. */
    hasEnded: boolean;
    /** Indicates whether this giveaway was cancelled (ended without winners). */
    cancelled: boolean;
    /** When this giveaway actually ended. */
    endedAt?: number | null;
    /** When this giveaway was paused, if it currently is. */
    pausedAt?: number | null;
    /** The id of the host for this giveaway. */
    hostID: Snowflake;
    /** The id of the guild this giveaway has been created on. */
    guildID: Snowflake;
    /** The id of the channel this giveaway has been created in. */
    channelID: Snowflake;
    /** The id of the message this giveaway is associated with. */
    messageID?: Snowflake | null;
    /** The user entries for this giveaway. */
    entries: Snowflake[];
    /** Entry weights for members who got bonus entries (sparse; absent means 1). */
    entryWeights?: Record<Snowflake, number> | null;
    /** The randomly selected winners of this giveaway. */
    winners: Snowflake[];
    /** The previous winners of this giveaway. */
    previousWinners?: Snowflake[] | null;
    /** The requirements all participants have to meet for entering this giveaway. */
    requirements?: IGiveawayRequirements | null;
    /** Roles granting extra entries. */
    bonusEntries?: IGiveawayBonusEntry[] | null;
    /** Maximum number of participants, if capped. */
    maxEntries?: number | null;
    /** Presentation options for the default messages. */
    display?: IGiveawayDisplay | null;
    constructor(options?: Partial<IGiveawayStartOptions> & {
        id?: Snowflake;
    });
    /** Returns the end timestamp of this giveaway. */
    endTimestamp(): number;
    /** Returns the time left for this giveaway (frozen while paused). */
    timeLeft(): number;
    /** Whether this giveaway is paused. */
    isPaused(): boolean;
    /** Whether this giveaway accepts entries right now. */
    isActive(): boolean;
    /** Returns whether a user has entered this giveaway. O(1). */
    hasEntered(userID: Snowflake): boolean;
    /**
     * Adds a user entry to this giveaway.
     * @param weight Number of tickets this entry counts for (bonus entries).
     */
    addEntry(userID: Snowflake, weight?: number): this | null;
    /** Removes a user entry from this giveaway. */
    removeEntry(userID: Snowflake): this | null;
    /** Records how many tickets an entry counts for. */
    setWeight(userID: Snowflake, weight: number): void;
    /** Number of tickets an entry counts for. */
    weightOf(userID: Snowflake): number;
    /** Total number of tickets across all entries. */
    totalTickets(): number;
    /** Computes a member's ticket count from the bonus entry roles. */
    computeWeight(member: AnyMember): number;
    /**
     * Returns why a member cannot enter, or null if they can.
     * @param checkCapacity Whether to also check the entry cap (only matters for new entries).
     */
    denyReason(member: AnyMember, checkCapacity?: boolean): GiveawayDenyReason | null;
    /** Like {@link denyReason} but ignores the ended/paused state. */
    requirementDenyReason(member: AnyMember, checkCapacity?: boolean): GiveawayDenyReason | null;
    /** Returns whether a member is eligible to enter this giveaway (requirements only). */
    canEnter(member: AnyMember): boolean;
    /**
     * Returns a deep copy that keeps the prototype, so methods like
     * `timeLeft()` still work on the copy (the original used `structuredClone`,
     * which returned a plain object without any methods).
     */
    clone(): this;
    /** Plain JSON view used by `$getGiveaway` and friends. */
    toJSON(): {
        id: string;
        prize: string;
        duration: number;
        timestamp: number;
        endTimestamp: number;
        timeLeft: number;
        winnersCount: number;
        hasEnded: boolean;
        cancelled: boolean;
        endedAt: number | null;
        isPaused: boolean;
        pausedAt: number | null;
        hostID: string;
        guildID: string;
        channelID: string;
        messageID: string | null;
        entries: string[];
        entriesCount: number;
        totalTickets: number;
        entryWeights: Record<string, number>;
        winners: string[];
        previousWinners: string[];
        requirements: IGiveawayRequirements;
        bonusEntries: IGiveawayBonusEntry[];
        maxEntries: number | null;
        display: IGiveawayDisplay;
    };
}
/**
 * Giveaway as stored in MongoDB. Kept as its own class for backwards
 * compatibility with code that imported it.
 */
export declare class MongoGiveaway extends Giveaway {
    /** The object id for MongoDB. */
    mongoId?: unknown;
}
export {};
//# sourceMappingURL=Giveaway.d.ts.map