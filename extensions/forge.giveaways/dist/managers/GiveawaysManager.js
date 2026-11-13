"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveawaysManager = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const structures_1 = require("../structures");
const messages_1 = require("../structures/messages");
const error_1 = require("../functions/error");
const utils_1 = require("../utils");
const noop_1 = __importDefault(require("../functions/noop"));
const MAX_MESSAGE = 2000;
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
class GiveawaysManager {
    client;
    giveaways;
    scheduler;
    renderer;
    #lock = new utils_1.KeyedMutex();
    #flushTimers = new Map();
    #refreshTimers = new Map();
    #restored = false;
    #sweepTimer = null;
    #ready;
    #markReady;
    constructor(client, giveaways) {
        this.client = client;
        this.giveaways = giveaways;
        const o = giveaways.options;
        this.renderer = new structures_1.Renderer({
            emoji: o.emoji,
            buttonLabel: o.buttonLabel,
            buttonStyle: o.buttonStyle,
            showEntryCount: o.showEntryCount,
            useReactions: !!o.useReactions,
            colors: o.colors,
            messages: o.messages,
        });
        this.scheduler = new utils_1.Scheduler((id) => this._onDeadline(id).catch(noop_1.default));
        this.#ready = new Promise((res) => (this.#markReady = res));
    }
    get messages() {
        return this.giveaways.options.messages;
    }
    /** Resolves once the database is connected. */
    whenReady() {
        return this.#ready;
    }
    /** @internal Called by the extension once the database is connected. */
    _onDatabaseReady() {
        this.#markReady();
        const client = this.client;
        if (client.isReady())
            this._restore().catch(noop_1.default);
        else
            client.once("clientReady", () => this._restore().catch(noop_1.default));
    }
    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------
    emit = (...args) => this.giveaways.emitter.emit(...args);
    async getChannel(channelID) {
        const cached = this.client.channels.cache.get(channelID);
        const chan = cached ?? (await this.client.channels.fetch(channelID).catch(() => null));
        return chan && chan.isTextBased() && "send" in chan ? chan : null;
    }
    /**
     * Fetches the message of a giveaway.
     * @param channelID The id of the channel to pull message from.
     * @param messageID The id of the message to fetch.
     */
    async fetchMessage(channelID, messageID) {
        if (!messageID || !/^\d{17,20}$/.test(messageID))
            return;
        const chan = await this.getChannel(channelID);
        if (!chan)
            return;
        return chan.messages.cache.get(messageID) ?? (await chan.messages.fetch(messageID).catch(() => undefined));
    }
    async getGuild(guildID) {
        return this.client.guilds.cache.get(guildID) ?? (await this.client.guilds.fetch(guildID).catch(() => null));
    }
    clearTimers(id) {
        const f = this.#flushTimers.get(id);
        if (f)
            clearTimeout(f);
        this.#flushTimers.delete(id);
        const r = this.#refreshTimers.get(id);
        if (r)
            clearTimeout(r);
        this.#refreshTimers.delete(id);
    }
    /** Persists a giveaway now (inside its lock). */
    async save(g) {
        const f = this.#flushTimers.get(g.id);
        if (f)
            clearTimeout(f);
        this.#flushTimers.delete(g.id);
        await structures_1.Database.set(g);
    }
    /** Queues a coalesced write of entry changes. */
    queueFlush(g) {
        const delay = this.giveaways.options.entryFlushDelay;
        if (delay <= 0)
            return this.save(g);
        if (this.#flushTimers.has(g.id))
            return;
        const t = setTimeout(() => {
            this.#flushTimers.delete(g.id);
            this.#lock.run(g.id, () => structures_1.Database.set(g)).catch(noop_1.default);
        }, delay);
        t.unref?.();
        this.#flushTimers.set(g.id, t);
    }
    /** Queues a refresh of the giveaway message (live entry count). */
    queueRefresh(g) {
        const { useDefault, showEntryCount } = this.giveaways.options;
        if (!useDefault || !g.messageID || this.#refreshTimers.has(g.id))
            return;
        if (!showEntryCount)
            return;
        const t = setTimeout(() => {
            this.#refreshTimers.delete(g.id);
            this.#lock.run(g.id, async () => {
                const cur = await structures_1.Database.get(g.id);
                if (cur && !cur.hasEnded)
                    await this.updateMessage(cur);
            }).catch(noop_1.default);
        }, this.giveaways.options.messageUpdateDelay);
        t.unref?.();
        this.#refreshTimers.set(g.id, t);
    }
    /** Writes every pending entry change to the database. */
    async flushAll() {
        const ids = [...this.#flushTimers.keys()];
        for (const id of ids) {
            clearTimeout(this.#flushTimers.get(id));
            this.#flushTimers.delete(id);
        }
        await Promise.all(ids.map((id) => this.#lock.run(id, async () => {
            const g = await structures_1.Database.get(id);
            if (g)
                await structures_1.Database.set(g);
        }).catch(noop_1.default)));
    }
    /** Re-renders the default giveaway message. */
    async updateMessage(g) {
        if (!this.giveaways.options.useDefault)
            return true;
        const msg = await this.fetchMessage(g.channelID, g.messageID);
        if (!msg) {
            (0, error_1.throwGiveawaysError)(error_1.GiveawaysErrorType.MessageNotFound, g.id);
            return false;
        }
        await msg.edit(this.renderer.payload(g)).catch(noop_1.default);
        return true;
    }
    schedule(g) {
        if (g.hasEnded || g.isPaused())
            this.scheduler.cancel(g.id);
        else
            this.scheduler.schedule(g.id, g.endTimestamp());
    }
    // ----------------------------------------------------------------------
    // Life cycle
    // ----------------------------------------------------------------------
    /**
     * Starts a new giveaway on a guild. There is no upper limit on the duration.
     * @param options The start options for the giveaway.
     */
    async start(options) {
        await this.#ready;
        const winnersCount = Math.floor(Number(options.winnersCount));
        const duration = Math.floor(Number(options.duration));
        if (!Number.isFinite(duration) || duration <= 0)
            throw new RangeError("Giveaway duration must be a positive amount of time");
        if (!Number.isSafeInteger(Date.now() + duration))
            throw new RangeError("Giveaway duration is too large");
        if (!Number.isFinite(winnersCount) || winnersCount < 1)
            throw new RangeError("Giveaway winners count must be at least 1");
        if (!options.prize?.trim())
            throw new RangeError("Giveaway prize must not be empty");
        const giveaway = structures_1.Database.create({ ...options, duration, winnersCount, prize: options.prize.trim() });
        if (giveaway.maxEntries != null && !(giveaway.maxEntries >= 1))
            giveaway.maxEntries = null;
        const { useDefault } = this.giveaways.options;
        if (useDefault) {
            const chan = await this.getChannel(giveaway.channelID);
            const ping = giveaway.display?.pingRoleID;
            const msg = await chan?.send({
                content: ping ? (0, messages_1.format)(this.messages.startPing, { ping: `<@&${ping}>` }) : undefined,
                ...this.renderer.payload(giveaway),
                allowedMentions: { parse: [], roles: ping ? [ping] : [] },
            }).catch(noop_1.default);
            if (!msg) {
                (0, error_1.throwGiveawaysError)(error_1.GiveawaysErrorType.MessageNotDetermined, giveaway.id);
                return null;
            }
            if (this.giveaways.options.useReactions)
                await msg.react(this.giveaways.options.emoji).catch(noop_1.default);
            giveaway.messageID = msg.id;
        }
        await structures_1.Database.set(giveaway);
        this.schedule(giveaway);
        this.emit("giveawayStart", giveaway.clone());
        return giveaway;
    }
    /**
     * Links a custom start message to a giveaway (used by the `giveawayStart`
     * event when default messages are disabled).
     */
    async attachMessage(id, messageID) {
        return this.#lock.run(id, async () => {
            const g = await structures_1.Database.get(id);
            if (!g)
                return null;
            g.messageID = messageID;
            await this.save(g);
            return g;
        });
    }
    /** Removes a giveaway and its timers without announcing anything. */
    async discard(id) {
        return this.#lock.run(id, async () => {
            this.scheduler.cancel(id);
            this.clearTimers(id);
            return await structures_1.Database.delete(id);
        });
    }
    /**
     * Timer path for ending. If the bot is disconnected right at the deadline,
     * drawing now would find no members and end with no winners, so retry a
     * minute later instead. Manual `end()` calls are never postponed.
     */
    async _onDeadline(id) {
        if (!this.client.isReady()) {
            this.scheduler.schedule(id, Date.now() + 60_000);
            return null;
        }
        return this.end(id);
    }
    /**
     * Ends an existing giveaway and draws the winners.
     * @param id The id of the giveaway to end.
     */
    async end(id) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || giveaway.hasEnded)
                return null;
            this.scheduler.cancel(id);
            this.clearTimers(id);
            giveaway.winners = await this.drawWinners(giveaway, giveaway.winnersCount);
            giveaway.hasEnded = true;
            giveaway.endedAt = Date.now();
            giveaway.pausedAt = null;
            await this.save(giveaway);
            if (this.giveaways.options.useDefault) {
                const msg = await this.fetchMessage(giveaway.channelID, giveaway.messageID);
                if (msg)
                    await msg.edit(this.renderer.payload(giveaway)).catch(noop_1.default);
                else
                    (0, error_1.throwGiveawaysError)(error_1.GiveawaysErrorType.MessageNotFound, giveaway.id);
                await this.announce(giveaway, msg, giveaway.winners, "winners");
            }
            if (this.giveaways.options.dmWinners)
                this.dmWinners(giveaway, giveaway.winners).catch(noop_1.default);
            this.emit("giveawayEnd", giveaway.clone());
            return giveaway;
        });
    }
    /**
     * Cancels a running giveaway: it ends without winners.
     */
    async cancel(id) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || giveaway.hasEnded)
                return null;
            this.scheduler.cancel(id);
            this.clearTimers(id);
            giveaway.hasEnded = true;
            giveaway.cancelled = true;
            giveaway.endedAt = Date.now();
            giveaway.pausedAt = null;
            giveaway.winners = [];
            await this.save(giveaway);
            await this.updateMessage(giveaway);
            this.emit("giveawayCancel", giveaway.clone());
            return giveaway;
        });
    }
    /**
     * Rerolls an ended giveaway.
     * @param id The id of the giveaway to reroll.
     * @param unique Whether everyone who already won is excluded.
     * @param amount The amount of new winners (defaults to the winners count).
     */
    async reroll(id, unique = false, amount) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || !giveaway.hasEnded || giveaway.cancelled || !giveaway.entries.length)
                return null;
            const oldGiveaway = giveaway.clone();
            const count = Math.floor(amount ?? giveaway.winnersCount);
            if (!(count >= 1))
                return null;
            const previous = [...new Set([...giveaway.previousWinners ?? [], ...giveaway.winners])];
            const newWinners = await this.drawWinners(giveaway, count, unique ? new Set(previous) : undefined);
            if (!newWinners.length)
                return null;
            giveaway.previousWinners = previous;
            giveaway.winners = newWinners;
            await this.save(giveaway);
            if (this.giveaways.options.useDefault) {
                const msg = await this.fetchMessage(giveaway.channelID, giveaway.messageID);
                if (msg)
                    await msg.edit(this.renderer.payload(giveaway)).catch(noop_1.default);
                await this.announce(giveaway, msg, newWinners, "reroll");
            }
            if (this.giveaways.options.dmWinners)
                this.dmWinners(giveaway, newWinners).catch(noop_1.default);
            this.emit("giveawayReroll", oldGiveaway, giveaway.clone());
            return giveaway;
        });
    }
    /**
     * Edits a running giveaway.
     * @param id The id of the giveaway to edit.
     * @param options The options used to edit this giveaway.
     */
    async edit(id, options) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || giveaway.hasEnded)
                return null;
            const oldGiveaway = giveaway.clone();
            if (options.prize?.trim())
                giveaway.prize = options.prize.trim();
            if (options.winnersCount != null && Math.floor(options.winnersCount) >= 1)
                giveaway.winnersCount = Math.floor(options.winnersCount);
            if (options.hostID)
                giveaway.hostID = options.hostID;
            // Builder functions are additive, so merge instead of replacing:
            // "$setMinimumAccountAge[7d] $editGiveaway[...]" must not drop the required roles.
            if (options.requirements && Object.keys(options.requirements).length)
                giveaway.requirements = { ...giveaway.requirements, ...options.requirements };
            if (options.bonusEntries?.length)
                giveaway.bonusEntries = options.bonusEntries;
            if (options.maxEntries !== undefined)
                giveaway.maxEntries = options.maxEntries && options.maxEntries >= 1 ? Math.floor(options.maxEntries) : null;
            if (options.display && Object.keys(options.display).length)
                giveaway.display = { ...giveaway.display, ...options.display };
            await this.save(giveaway);
            await this.updateMessage(giveaway);
            this.emit("giveawayEdit", oldGiveaway, giveaway.clone());
            return giveaway;
        });
    }
    /**
     * Adds (or with a negative value removes) time from a running giveaway.
     * Shortening never moves the end before "now"; the giveaway then ends immediately.
     */
    async extend(id, ms) {
        await this.#ready;
        if (!Number.isFinite(ms) || ms === 0)
            return null;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || giveaway.hasEnded)
                return null;
            const oldGiveaway = giveaway.clone();
            const floor = (giveaway.pausedAt ?? Date.now()) - giveaway.timestamp;
            const next = Math.max(giveaway.duration + Math.trunc(ms), floor);
            if (!Number.isSafeInteger(giveaway.timestamp + next))
                return null;
            giveaway.duration = next;
            await this.save(giveaway);
            this.schedule(giveaway);
            await this.updateMessage(giveaway);
            this.emit("giveawayEdit", oldGiveaway, giveaway.clone());
            return giveaway;
        });
    }
    /** Pauses a running giveaway: the timer stops and nobody can join or leave. */
    async pause(id) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || giveaway.hasEnded || giveaway.isPaused())
                return null;
            giveaway.pausedAt = Date.now();
            this.scheduler.cancel(id);
            await this.save(giveaway);
            await this.updateMessage(giveaway);
            this.emit("giveawayPause", giveaway.clone());
            return giveaway;
        });
    }
    /** Resumes a paused giveaway with the time it had left. */
    async resume(id) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || !giveaway.isPaused())
                return null;
            giveaway.duration += Date.now() - giveaway.pausedAt;
            giveaway.pausedAt = null;
            await this.save(giveaway);
            this.schedule(giveaway);
            await this.updateMessage(giveaway);
            this.emit("giveawayResume", giveaway.clone());
            return giveaway;
        });
    }
    // ----------------------------------------------------------------------
    // Entries
    // ----------------------------------------------------------------------
    /**
     * Toggles a member's entry: joins if not entered, leaves otherwise.
     * Used by the button handler.
     */
    async toggleEntry(id, member, source, user) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway)
                return null;
            const userID = member.user.id;
            if (!giveaway.hasEnded && !giveaway.isPaused() && giveaway.hasEntered(userID)) {
                const old = giveaway.clone();
                giveaway.removeEntry(userID);
                await this.queueFlush(giveaway);
                this.queueRefresh(giveaway);
                this.emit("giveawayEntryRemove", old, giveaway.clone(), source, user);
                return { action: "removed", giveaway };
            }
            return this.#add(giveaway, member, source, user);
        });
    }
    /** Adds a member's entry (used by reactions). */
    async join(id, member, source, user) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway)
                return null;
            if (giveaway.hasEntered(member.id))
                return { action: "added", giveaway };
            return this.#add(giveaway, member, source, user);
        });
    }
    async #add(giveaway, member, source, user) {
        const reason = giveaway.denyReason(member, true);
        if (reason) {
            this.emit("giveawayEntryRevoke", giveaway.clone(), source, user, reason);
            return { action: "denied", reason, giveaway };
        }
        const old = giveaway.clone();
        giveaway.addEntry(member.user.id, giveaway.computeWeight(member));
        await this.queueFlush(giveaway);
        this.queueRefresh(giveaway);
        this.emit("giveawayEntryAdd", old, giveaway.clone(), source, user);
        return { action: "added", giveaway };
    }
    /**
     * Removes an entry. Returns the giveaway, or null if it was not entered/active.
     * @param force Also remove entries while paused or ended.
     */
    async leave(id, userID, source, user, force = false) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || (!force && !giveaway.isActive()) || !giveaway.hasEntered(userID))
                return null;
            const old = giveaway.clone();
            giveaway.removeEntry(userID);
            await (force ? this.save(giveaway) : this.queueFlush(giveaway));
            this.queueRefresh(giveaway);
            if (source && user)
                this.emit("giveawayEntryRemove", old, giveaway.clone(), source, user);
            return giveaway;
        });
    }
    /**
     * Adds an entry on someone's behalf.
     * @param bypassRequirements Skip requirement checks (still respects ended state).
     */
    async addEntry(id, userID, bypassRequirements = false) {
        await this.#ready;
        return this.#lock.run(id, async () => {
            const giveaway = await structures_1.Database.get(id);
            if (!giveaway || giveaway.hasEnded || giveaway.hasEntered(userID))
                return null;
            const guild = await this.getGuild(giveaway.guildID);
            const member = await guild?.members.fetch(userID).catch(() => null);
            if (!member && !bypassRequirements)
                return null;
            if (member && !bypassRequirements && giveaway.requirementDenyReason(member, true))
                return null;
            giveaway.addEntry(userID, member ? giveaway.computeWeight(member) : 1);
            await this.save(giveaway);
            this.queueRefresh(giveaway);
            return giveaway;
        });
    }
    // ----------------------------------------------------------------------
    // Winners
    // ----------------------------------------------------------------------
    /**
     * Draws up to `count` winners. Candidates are put in a random order
     * (weighted by bonus entries) using a cryptographically secure RNG and then
     * checked one by one, so only as many members are fetched as needed instead
     * of every entrant, and people who left the server or no longer meet the
     * requirements are skipped.
     */
    async drawWinners(g, count, exclude) {
        const pool = exclude ? g.entries.filter((e) => !exclude.has(e)) : [...g.entries];
        if (!pool.length || count < 1)
            return [];
        const guild = await this.getGuild(g.guildID);
        if (!guild)
            return [];
        const weighted = !!g.bonusEntries?.length || !!(g.entryWeights && Object.keys(g.entryWeights).length);
        const order = weighted
            ? (0, utils_1.weightedOrder)(pool, (id) => {
                const m = guild.members.cache.get(id);
                return m ? g.computeWeight(m) : g.weightOf(id);
            })
            : (0, utils_1.shuffle)(pool);
        const winners = [];
        let i = 0;
        while (winners.length < count && i < order.length) {
            const need = count - winners.length;
            const batch = order.slice(i, i + Math.min(100, Math.max(need * 2, 10)));
            i += batch.length;
            const members = await this.fetchMembers(guild, batch);
            for (const id of batch) {
                const m = members.get(id);
                if (m && g.requirementDenyReason(m) === null) {
                    winners.push(id);
                    if (winners.length === count)
                        break;
                }
            }
        }
        return winners;
    }
    async fetchMembers(guild, ids) {
        const found = new Map();
        const missing = [];
        for (const id of ids) {
            const m = guild.members.cache.get(id);
            if (m)
                found.set(id, m);
            else
                missing.push(id);
        }
        if (!missing.length)
            return found;
        const fetched = await guild.members.fetch({ user: missing, time: 15_000 }).catch(() => null);
        if (fetched) {
            for (const [id, m] of fetched)
                found.set(id, m);
        }
        else {
            // Gateway member requests can time out; fall back to REST.
            const results = await Promise.allSettled(missing.map((id) => guild.members.fetch(id)));
            for (const r of results)
                if (r.status === "fulfilled")
                    found.set(r.value.id, r.value);
        }
        return found;
    }
    async announce(g, msg, winners, kind) {
        const chan = msg ? msg.channel : await this.getChannel(g.channelID);
        if (!chan || !("send" in chan))
            return;
        const m = this.messages;
        const s = winners.length === 1 ? "" : "s";
        if (!winners.length) {
            await (msg
                ? msg.reply({ content: (0, messages_1.format)(m.noWinners, { prize: g.prize }), allowedMentions: { parse: [], repliedUser: false } })
                : chan.send({ content: (0, messages_1.format)(m.noWinners, { prize: g.prize }), allowedMentions: { parse: [] } })).catch(noop_1.default);
            return;
        }
        const head = (0, messages_1.format)(kind === "winners" ? m.winners : m.reroll, { prize: g.prize, s, mentions: "" });
        const room = Math.max(200, MAX_MESSAGE - head.length - 10);
        const groups = (0, utils_1.chunk)(winners, 90);
        let first = true;
        for (const group of groups) {
            for (const part of (0, utils_1.chunkJoin)(group.map((id) => `<@${id}>`), ", ", room)) {
                const users = part.match(/\d{17,20}/g) ?? [];
                const content = (0, messages_1.format)(first ? (kind === "winners" ? m.winners : m.reroll) : m.winnersContinued, { prize: g.prize, s, mentions: part });
                const payload = { content: content.slice(0, MAX_MESSAGE), allowedMentions: { parse: [], users, repliedUser: false } };
                await (first && msg ? msg.reply(payload) : chan.send(payload)).catch(noop_1.default);
                first = false;
            }
        }
    }
    async dmWinners(g, winners) {
        const guild = this.client.guilds.cache.get(g.guildID);
        const link = g.messageID ? `https://discord.com/channels/${g.guildID}/${g.channelID}/${g.messageID}` : "";
        const content = (0, messages_1.format)(this.messages.winnerDM, { prize: g.prize, guild: guild?.name ?? "the server", link }).slice(0, MAX_MESSAGE);
        for (const id of winners) {
            const user = await this.client.users.fetch(id).catch(() => null);
            await user?.send({ content, allowedMentions: { parse: [] } }).catch(() => { });
        }
    }
    // ----------------------------------------------------------------------
    // Start-up and maintenance
    // ----------------------------------------------------------------------
    /** @internal Restores timers for active giveaways after a restart. */
    async _restore() {
        if (this.#restored)
            return;
        this.#restored = true;
        for (const g of structures_1.Database.activeGiveaways())
            this.schedule(g);
        const keep = this.giveaways.options.deleteEndedAfter;
        if (keep && keep > 0) {
            await this.sweep(keep).catch(noop_1.default);
            this.#sweepTimer = setInterval(() => this.sweep(keep).catch(noop_1.default), Math.min(keep, 6 * 36e5));
            this.#sweepTimer.unref?.();
        }
        forgescript_1.Logger.info(`[ForgeGiveaways] Restored ${this.scheduler.size} active giveaway(s)`);
    }
    /** Deletes giveaways that ended more than `olderThan` ms ago. Returns how many. */
    async sweep(olderThan) {
        const cutoff = Date.now() - olderThan;
        const ended = await structures_1.Database.find({ hasEnded: true });
        const stale = ended.filter((g) => (g.endedAt ?? g.endTimestamp()) < cutoff).map((g) => g.id);
        return structures_1.Database.deleteMany(stale);
    }
    /** Stops all timers and writes pending changes. */
    async destroy() {
        this.scheduler.clear();
        if (this.#sweepTimer)
            clearInterval(this.#sweepTimer);
        for (const t of this.#refreshTimers.values())
            clearTimeout(t);
        this.#refreshTimers.clear();
        await this.flushAll();
    }
}
exports.GiveawaysManager = GiveawaysManager;
//# sourceMappingURL=GiveawaysManager.js.map