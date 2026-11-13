import { APIInteractionGuildMember, GuildMember, Snowflake, SnowflakeUtil } from "discord.js"

export type RequiredRolesMode = "all" | "any"

export interface IGiveawayRequirements {
    /** Roles a member must have (see {@link requiredRolesMode}). */
    requiredRoles?: Snowflake[]
    /** Whether members need `all` required roles (default) or `any` of them. */
    requiredRolesMode?: RequiredRolesMode
    /** Members with any of these roles cannot enter. */
    restrictedRoles?: Snowflake[]
    /** These members cannot enter. */
    restrictedMembers?: Snowflake[]
    /** Minimum Discord account age in ms. */
    minAccountAge?: number
    /** Minimum time in ms since the member joined the guild. */
    minMemberAge?: number
}

export interface IGiveawayBonusEntry {
    /** The role granting the bonus. */
    roleID: Snowflake
    /** Extra entries (tickets) members with this role get. */
    amount: number
}

export interface IGiveawayDisplay {
    /** Extra text shown in the default giveaway embed. */
    description?: string
    /** Embed color override (hex number). */
    color?: number
    /** Large image URL for the default embed. */
    image?: string
    /** Thumbnail URL for the default embed. */
    thumbnail?: string
    /** Role pinged when the giveaway starts (default messages only). */
    pingRoleID?: Snowflake
}

export interface IGiveawayStartOptions {
    prize: string
    duration: number
    winnersCount: number
    hostID: Snowflake
    guildID: Snowflake
    channelID: Snowflake
    requirements?: IGiveawayRequirements | null
    bonusEntries?: IGiveawayBonusEntry[] | null
    maxEntries?: number | null
    display?: IGiveawayDisplay | null
}

export interface IGiveaway extends IGiveawayStartOptions {
    id: Snowflake
    timestamp: number
    hasEnded: boolean
    messageID?: Snowflake | null
    entries: Snowflake[]
    winners: Snowflake[]
    previousWinners?: Snowflake[] | null
}

/**
 * Why a member could not enter a giveaway. `null` means they can.
 */
export enum GiveawayDenyReason {
    MissingRoles = "missingRoles",
    RestrictedRole = "restrictedRole",
    RestrictedMember = "restrictedMember",
    AccountTooNew = "accountTooNew",
    MemberTooNew = "memberTooNew",
    EntriesFull = "entriesFull",
    Ended = "ended",
    Paused = "paused",
}

const entryIndex = new WeakMap<object, { source: string[], set: Set<string> }>()

/**
 * O(1) membership index for a giveaway's entries. TypeORM may hydrate rows
 * without running field initialisers and `clone()` uses Object.create, so the
 * index lives in a WeakMap rather than in a (private) instance field. It is
 * rebuilt whenever the array was replaced or changed behind our back.
 */
function entrySet(g: { entries: string[] }) {
    let index = entryIndex.get(g)
    if (!index || index.source !== g.entries || index.set.size !== g.entries.length) {
        index = { source: g.entries, set: new Set(g.entries) }
        entryIndex.set(g, index)
    }
    return index.set
}

type AnyMember = GuildMember | APIInteractionGuildMember

function memberRoles(member: AnyMember): readonly string[] {
    return member instanceof GuildMember ? [...member.roles.cache.keys()] : member.roles
}

function memberJoinedAt(member: AnyMember): number | null {
    if (member instanceof GuildMember) return member.joinedTimestamp
    const t = member.joined_at ? Date.parse(member.joined_at) : NaN
    return Number.isNaN(t) ? null : t
}

/**
 * A giveaway. This is a plain domain object: persistence mapping lives in
 * `schema.ts`, so the same class works for every database driver.
 */
export class Giveaway implements IGiveaway {
    /** The id of this giveaway. */
    public id: Snowflake
    /** The prize of this giveaway. */
    public prize: string
    /** The duration of this giveaway in ms (grows when paused or extended). */
    public duration: number
    /** The timestamp this giveaway has been created at. */
    public timestamp: number
    /** The max amount of winners for this giveaway. */
    public winnersCount: number
    /** Indicates whether this giveaway has ended. */
    public hasEnded: boolean
    /** Indicates whether this giveaway was cancelled (ended without winners). */
    public cancelled: boolean
    /** When this giveaway actually ended. */
    public endedAt?: number | null
    /** When this giveaway was paused, if it currently is. */
    public pausedAt?: number | null
    /** The id of the host for this giveaway. */
    public hostID: Snowflake
    /** The id of the guild this giveaway has been created on. */
    public guildID: Snowflake
    /** The id of the channel this giveaway has been created in. */
    public channelID: Snowflake
    /** The id of the message this giveaway is associated with. */
    public messageID?: Snowflake | null
    /** The user entries for this giveaway. */
    public entries: Snowflake[]
    /** Entry weights for members who got bonus entries (sparse; absent means 1). */
    public entryWeights?: Record<Snowflake, number> | null
    /** The randomly selected winners of this giveaway. */
    public winners: Snowflake[]
    /** The previous winners of this giveaway. */
    public previousWinners?: Snowflake[] | null
    /** The requirements all participants have to meet for entering this giveaway. */
    public requirements?: IGiveawayRequirements | null
    /** Roles granting extra entries. */
    public bonusEntries?: IGiveawayBonusEntry[] | null
    /** Maximum number of participants, if capped. */
    public maxEntries?: number | null
    /** Presentation options for the default messages. */
    public display?: IGiveawayDisplay | null

    constructor(options?: Partial<IGiveawayStartOptions> & { id?: Snowflake }) {
        this.id = options?.id ?? SnowflakeUtil.generate().toString()
        this.prize = options?.prize ?? ""
        this.duration = options?.duration ?? 0
        this.winnersCount = options?.winnersCount ?? 1
        this.hostID = options?.hostID ?? ""
        this.guildID = options?.guildID ?? ""
        this.channelID = options?.channelID ?? ""
        this.requirements = options?.requirements ?? null
        this.bonusEntries = options?.bonusEntries?.length ? options.bonusEntries : null
        this.maxEntries = options?.maxEntries ?? null
        this.display = options?.display ?? null
        this.timestamp = Number(SnowflakeUtil.timestampFrom(this.id))
        this.hasEnded = false
        this.cancelled = false
        this.endedAt = null
        this.pausedAt = null
        this.entries = []
        this.entryWeights = null
        this.winners = []
        this.previousWinners = null
    }

    /** Returns the end timestamp of this giveaway. */
    public endTimestamp() {
        return this.timestamp + this.duration
    }

    /** Returns the time left for this giveaway (frozen while paused). */
    public timeLeft() {
        const now = this.pausedAt ?? Date.now()
        return Math.max(this.endTimestamp() - now, 0)
    }

    /** Whether this giveaway is paused. */
    public isPaused() {
        return !this.hasEnded && this.pausedAt != null
    }

    /** Whether this giveaway accepts entries right now. */
    public isActive() {
        return !this.hasEnded && this.pausedAt == null
    }

    /** Returns whether a user has entered this giveaway. O(1). */
    public hasEntered(userID: Snowflake) {
        return entrySet(this).has(userID)
    }

    /**
     * Adds a user entry to this giveaway.
     * @param weight Number of tickets this entry counts for (bonus entries).
     */
    public addEntry(userID: Snowflake, weight = 1) {
        if (this.hasEntered(userID)) return null
        this.entries.push(userID)
        entrySet(this).add(userID)
        this.setWeight(userID, weight)
        return this
    }

    /** Removes a user entry from this giveaway. */
    public removeEntry(userID: Snowflake) {
        if (!this.hasEntered(userID)) return null
        const idx = this.entries.indexOf(userID)
        if (idx !== -1) this.entries.splice(idx, 1)
        entrySet(this).delete(userID)
        if (this.entryWeights) delete this.entryWeights[userID]
        return this
    }

    /** Records how many tickets an entry counts for. */
    public setWeight(userID: Snowflake, weight: number) {
        if (weight > 1) (this.entryWeights ??= {})[userID] = weight
        else if (this.entryWeights) delete this.entryWeights[userID]
    }

    /** Number of tickets an entry counts for. */
    public weightOf(userID: Snowflake) {
        return this.entryWeights?.[userID] ?? 1
    }

    /** Total number of tickets across all entries. */
    public totalTickets() {
        let total = 0
        for (const id of this.entries) total += this.weightOf(id)
        return total
    }

    /** Computes a member's ticket count from the bonus entry roles. */
    public computeWeight(member: AnyMember) {
        if (!this.bonusEntries?.length) return 1
        const roles = memberRoles(member)
        let weight = 1
        for (const bonus of this.bonusEntries) if (roles.includes(bonus.roleID)) weight += bonus.amount
        return weight
    }

    /**
     * Returns why a member cannot enter, or null if they can.
     * @param checkCapacity Whether to also check the entry cap (only matters for new entries).
     */
    public denyReason(member: AnyMember, checkCapacity = false): GiveawayDenyReason | null {
        if (this.hasEnded) return GiveawayDenyReason.Ended
        if (this.pausedAt != null) return GiveawayDenyReason.Paused
        return this.requirementDenyReason(member, checkCapacity)
    }

    /** Like {@link denyReason} but ignores the ended/paused state. */
    public requirementDenyReason(member: AnyMember, checkCapacity = false): GiveawayDenyReason | null {
        const userID = member.user.id
        const req = this.requirements
        const full = () => checkCapacity && !!this.maxEntries && this.entries.length >= this.maxEntries && !this.hasEntered(userID)
        if (!req) return full() ? GiveawayDenyReason.EntriesFull : null

        if (req.restrictedMembers?.includes(userID)) return GiveawayDenyReason.RestrictedMember

        const roles = memberRoles(member)
        if (req.restrictedRoles?.some((r) => roles.includes(r))) return GiveawayDenyReason.RestrictedRole

        if (req.requiredRoles?.length) {
            const ok = req.requiredRolesMode === "any"
                ? req.requiredRoles.some((r) => roles.includes(r))
                : req.requiredRoles.every((r) => roles.includes(r))
            if (!ok) return GiveawayDenyReason.MissingRoles
        }

        const now = Date.now()
        if (req.minAccountAge && now - SnowflakeUtil.timestampFrom(userID) < req.minAccountAge) {
            return GiveawayDenyReason.AccountTooNew
        }

        if (req.minMemberAge) {
            const joined = memberJoinedAt(member)
            if (joined == null || now - joined < req.minMemberAge) return GiveawayDenyReason.MemberTooNew
        }

        // Capacity last, so ineligible members hear the real reason.
        return full() ? GiveawayDenyReason.EntriesFull : null
    }

    /** Returns whether a member is eligible to enter this giveaway (requirements only). */
    public canEnter(member: AnyMember) {
        return this.requirementDenyReason(member) === null
    }

    /**
     * Returns a deep copy that keeps the prototype, so methods like
     * `timeLeft()` still work on the copy (the original used `structuredClone`,
     * which returned a plain object without any methods).
     */
    public clone(): this {
        const copy = Object.create(Object.getPrototypeOf(this)) as this
        for (const key of Object.keys(this) as (keyof this)[]) {
            const value = this[key]
            copy[key] = (value && typeof value === "object" ? structuredClone(value) : value) as this[keyof this]
        }
        return copy
    }

    /** Plain JSON view used by `$getGiveaway` and friends. */
    public toJSON() {
        return {
            id: this.id,
            prize: this.prize,
            duration: this.duration,
            timestamp: this.timestamp,
            endTimestamp: this.endTimestamp(),
            timeLeft: this.timeLeft(),
            winnersCount: this.winnersCount,
            hasEnded: this.hasEnded,
            cancelled: this.cancelled,
            endedAt: this.endedAt ?? null,
            isPaused: this.isPaused(),
            pausedAt: this.pausedAt ?? null,
            hostID: this.hostID,
            guildID: this.guildID,
            channelID: this.channelID,
            messageID: this.messageID ?? null,
            entries: this.entries,
            entriesCount: this.entries.length,
            totalTickets: this.totalTickets(),
            entryWeights: this.entryWeights ?? {},
            winners: this.winners,
            previousWinners: this.previousWinners ?? [],
            requirements: this.requirements ?? {},
            bonusEntries: this.bonusEntries ?? [],
            maxEntries: this.maxEntries ?? null,
            display: this.display ?? {},
        }
    }
}

/**
 * Giveaway as stored in MongoDB. Kept as its own class for backwards
 * compatibility with code that imported it.
 */
export class MongoGiveaway extends Giveaway {
    /** The object id for MongoDB. */
    public mongoId?: unknown
}
