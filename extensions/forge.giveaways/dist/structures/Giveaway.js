"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoGiveaway = exports.Giveaway = exports.GiveawayDenyReason = void 0;
const discord_js_1 = require("discord.js");
/**
 * Why a member could not enter a giveaway. `null` means they can.
 */
var GiveawayDenyReason;
(function (GiveawayDenyReason) {
    GiveawayDenyReason["MissingRoles"] = "missingRoles";
    GiveawayDenyReason["RestrictedRole"] = "restrictedRole";
    GiveawayDenyReason["RestrictedMember"] = "restrictedMember";
    GiveawayDenyReason["AccountTooNew"] = "accountTooNew";
    GiveawayDenyReason["MemberTooNew"] = "memberTooNew";
    GiveawayDenyReason["EntriesFull"] = "entriesFull";
    GiveawayDenyReason["Ended"] = "ended";
    GiveawayDenyReason["Paused"] = "paused";
})(GiveawayDenyReason || (exports.GiveawayDenyReason = GiveawayDenyReason = {}));
const entryIndex = new WeakMap();
/**
 * O(1) membership index for a giveaway's entries. TypeORM may hydrate rows
 * without running field initialisers and `clone()` uses Object.create, so the
 * index lives in a WeakMap rather than in a (private) instance field. It is
 * rebuilt whenever the array was replaced or changed behind our back.
 */
function entrySet(g) {
    let index = entryIndex.get(g);
    if (!index || index.source !== g.entries || index.set.size !== g.entries.length) {
        index = { source: g.entries, set: new Set(g.entries) };
        entryIndex.set(g, index);
    }
    return index.set;
}
function memberRoles(member) {
    return member instanceof discord_js_1.GuildMember ? [...member.roles.cache.keys()] : member.roles;
}
function memberJoinedAt(member) {
    if (member instanceof discord_js_1.GuildMember)
        return member.joinedTimestamp;
    const t = member.joined_at ? Date.parse(member.joined_at) : NaN;
    return Number.isNaN(t) ? null : t;
}
/**
 * A giveaway. This is a plain domain object: persistence mapping lives in
 * `schema.ts`, so the same class works for every database driver.
 */
class Giveaway {
    /** The id of this giveaway. */
    id;
    /** The prize of this giveaway. */
    prize;
    /** The duration of this giveaway in ms (grows when paused or extended). */
    duration;
    /** The timestamp this giveaway has been created at. */
    timestamp;
    /** The max amount of winners for this giveaway. */
    winnersCount;
    /** Indicates whether this giveaway has ended. */
    hasEnded;
    /** Indicates whether this giveaway was cancelled (ended without winners). */
    cancelled;
    /** When this giveaway actually ended. */
    endedAt;
    /** When this giveaway was paused, if it currently is. */
    pausedAt;
    /** The id of the host for this giveaway. */
    hostID;
    /** The id of the guild this giveaway has been created on. */
    guildID;
    /** The id of the channel this giveaway has been created in. */
    channelID;
    /** The id of the message this giveaway is associated with. */
    messageID;
    /** The user entries for this giveaway. */
    entries;
    /** Entry weights for members who got bonus entries (sparse; absent means 1). */
    entryWeights;
    /** The randomly selected winners of this giveaway. */
    winners;
    /** The previous winners of this giveaway. */
    previousWinners;
    /** The requirements all participants have to meet for entering this giveaway. */
    requirements;
    /** Roles granting extra entries. */
    bonusEntries;
    /** Maximum number of participants, if capped. */
    maxEntries;
    /** Presentation options for the default messages. */
    display;
    constructor(options) {
        this.id = options?.id ?? discord_js_1.SnowflakeUtil.generate().toString();
        this.prize = options?.prize ?? "";
        this.duration = options?.duration ?? 0;
        this.winnersCount = options?.winnersCount ?? 1;
        this.hostID = options?.hostID ?? "";
        this.guildID = options?.guildID ?? "";
        this.channelID = options?.channelID ?? "";
        this.requirements = options?.requirements ?? null;
        this.bonusEntries = options?.bonusEntries?.length ? options.bonusEntries : null;
        this.maxEntries = options?.maxEntries ?? null;
        this.display = options?.display ?? null;
        this.timestamp = Number(discord_js_1.SnowflakeUtil.timestampFrom(this.id));
        this.hasEnded = false;
        this.cancelled = false;
        this.endedAt = null;
        this.pausedAt = null;
        this.entries = [];
        this.entryWeights = null;
        this.winners = [];
        this.previousWinners = null;
    }
    /** Returns the end timestamp of this giveaway. */
    endTimestamp() {
        return this.timestamp + this.duration;
    }
    /** Returns the time left for this giveaway (frozen while paused). */
    timeLeft() {
        const now = this.pausedAt ?? Date.now();
        return Math.max(this.endTimestamp() - now, 0);
    }
    /** Whether this giveaway is paused. */
    isPaused() {
        return !this.hasEnded && this.pausedAt != null;
    }
    /** Whether this giveaway accepts entries right now. */
    isActive() {
        return !this.hasEnded && this.pausedAt == null;
    }
    /** Returns whether a user has entered this giveaway. O(1). */
    hasEntered(userID) {
        return entrySet(this).has(userID);
    }
    /**
     * Adds a user entry to this giveaway.
     * @param weight Number of tickets this entry counts for (bonus entries).
     */
    addEntry(userID, weight = 1) {
        if (this.hasEntered(userID))
            return null;
        this.entries.push(userID);
        entrySet(this).add(userID);
        this.setWeight(userID, weight);
        return this;
    }
    /** Removes a user entry from this giveaway. */
    removeEntry(userID) {
        if (!this.hasEntered(userID))
            return null;
        const idx = this.entries.indexOf(userID);
        if (idx !== -1)
            this.entries.splice(idx, 1);
        entrySet(this).delete(userID);
        if (this.entryWeights)
            delete this.entryWeights[userID];
        return this;
    }
    /** Records how many tickets an entry counts for. */
    setWeight(userID, weight) {
        if (weight > 1)
            (this.entryWeights ??= {})[userID] = weight;
        else if (this.entryWeights)
            delete this.entryWeights[userID];
    }
    /** Number of tickets an entry counts for. */
    weightOf(userID) {
        return this.entryWeights?.[userID] ?? 1;
    }
    /** Total number of tickets across all entries. */
    totalTickets() {
        let total = 0;
        for (const id of this.entries)
            total += this.weightOf(id);
        return total;
    }
    /** Computes a member's ticket count from the bonus entry roles. */
    computeWeight(member) {
        if (!this.bonusEntries?.length)
            return 1;
        const roles = memberRoles(member);
        let weight = 1;
        for (const bonus of this.bonusEntries)
            if (roles.includes(bonus.roleID))
                weight += bonus.amount;
        return weight;
    }
    /**
     * Returns why a member cannot enter, or null if they can.
     * @param checkCapacity Whether to also check the entry cap (only matters for new entries).
     */
    denyReason(member, checkCapacity = false) {
        if (this.hasEnded)
            return GiveawayDenyReason.Ended;
        if (this.pausedAt != null)
            return GiveawayDenyReason.Paused;
        return this.requirementDenyReason(member, checkCapacity);
    }
    /** Like {@link denyReason} but ignores the ended/paused state. */
    requirementDenyReason(member, checkCapacity = false) {
        const userID = member.user.id;
        const req = this.requirements;
        const full = () => checkCapacity && !!this.maxEntries && this.entries.length >= this.maxEntries && !this.hasEntered(userID);
        if (!req)
            return full() ? GiveawayDenyReason.EntriesFull : null;
        if (req.restrictedMembers?.includes(userID))
            return GiveawayDenyReason.RestrictedMember;
        const roles = memberRoles(member);
        if (req.restrictedRoles?.some((r) => roles.includes(r)))
            return GiveawayDenyReason.RestrictedRole;
        if (req.requiredRoles?.length) {
            const ok = req.requiredRolesMode === "any"
                ? req.requiredRoles.some((r) => roles.includes(r))
                : req.requiredRoles.every((r) => roles.includes(r));
            if (!ok)
                return GiveawayDenyReason.MissingRoles;
        }
        const now = Date.now();
        if (req.minAccountAge && now - discord_js_1.SnowflakeUtil.timestampFrom(userID) < req.minAccountAge) {
            return GiveawayDenyReason.AccountTooNew;
        }
        if (req.minMemberAge) {
            const joined = memberJoinedAt(member);
            if (joined == null || now - joined < req.minMemberAge)
                return GiveawayDenyReason.MemberTooNew;
        }
        // Capacity last, so ineligible members hear the real reason.
        return full() ? GiveawayDenyReason.EntriesFull : null;
    }
    /** Returns whether a member is eligible to enter this giveaway (requirements only). */
    canEnter(member) {
        return this.requirementDenyReason(member) === null;
    }
    /**
     * Returns a deep copy that keeps the prototype, so methods like
     * `timeLeft()` still work on the copy (the original used `structuredClone`,
     * which returned a plain object without any methods).
     */
    clone() {
        const copy = Object.create(Object.getPrototypeOf(this));
        for (const key of Object.keys(this)) {
            const value = this[key];
            copy[key] = (value && typeof value === "object" ? structuredClone(value) : value);
        }
        return copy;
    }
    /** Plain JSON view used by `$getGiveaway` and friends. */
    toJSON() {
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
        };
    }
}
exports.Giveaway = Giveaway;
/**
 * Giveaway as stored in MongoDB. Kept as its own class for backwards
 * compatibility with code that imported it.
 */
class MongoGiveaway extends Giveaway {
    /** The object id for MongoDB. */
    mongoId;
}
exports.MongoGiveaway = MongoGiveaway;
//# sourceMappingURL=Giveaway.js.map