import { Guild, GuildMember, Message, Snowflake, User } from "discord.js"
import { ForgeClient, Logger } from "@tryforge/forgescript"
import {
    Database,
    Giveaway,
    GiveawayDenyReason,
    IGiveawayBonusEntry,
    IGiveawayDisplay,
    IGiveawayRequirements,
    IGiveawayStartOptions,
    Renderer,
} from "../structures"
import { format, GiveawayMessages } from "../structures/messages"
import { GiveawaysErrorType, throwGiveawaysError } from "../functions/error"
import { chunk, chunkJoin, KeyedMutex, Scheduler, shuffle, weightedOrder } from "../utils"
import type { ForgeGiveaways } from ".."
import type { EntryContext } from "../handlers/GiveawaysEventHandler"
import noop from "../functions/noop"

export type { IGiveawayStartOptions } from "../structures/Giveaway"

export interface IGiveawayEditOptions {
    prize?: string
    winnersCount?: number
    hostID?: Snowflake
    requirements?: IGiveawayRequirements
    bonusEntries?: IGiveawayBonusEntry[]
    maxEntries?: number | null
    display?: IGiveawayDisplay
}

export interface IEntryResult {
    action: "added" | "removed" | "denied"
    reason?: GiveawayDenyReason
    giveaway: Giveaway
}

const MAX_MESSAGE = 2000

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
export class GiveawaysManager {
    public readonly scheduler: Scheduler
    public readonly renderer: Renderer

    readonly #lock = new KeyedMutex()
    readonly #flushTimers = new Map<Snowflake, NodeJS.Timeout>()
    readonly #refreshTimers = new Map<Snowflake, NodeJS.Timeout>()
    #restored = false
    #sweepTimer: NodeJS.Timeout | null = null
    #ready: Promise<void>
    #markReady!: () => void

    public constructor(private readonly client: ForgeClient, private readonly giveaways: ForgeGiveaways) {
        const o = giveaways.options
        this.renderer = new Renderer({
            emoji: o.emoji!,
            buttonLabel: o.buttonLabel!,
            buttonStyle: o.buttonStyle!,
            showEntryCount: o.showEntryCount!,
            useReactions: !!o.useReactions,
            colors: o.colors as Required<NonNullable<typeof o.colors>>,
            messages: o.messages as GiveawayMessages,
        })
        this.scheduler = new Scheduler((id) => this._onDeadline(id).catch(noop))
        this.#ready = new Promise((res) => (this.#markReady = res))
    }

    private get messages() {
        return this.giveaways.options.messages as GiveawayMessages
    }

    /** Resolves once the database is connected. */
    public whenReady() {
        return this.#ready
    }

    /** @internal Called by the extension once the database is connected. */
    public _onDatabaseReady() {
        this.#markReady()
        const client = this.client as ForgeClient
        if (client.isReady()) this._restore().catch(noop)
        else (client as ForgeClient).once("clientReady", () => this._restore().catch(noop))
    }

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    private emit: ForgeGiveaways["emitter"]["emit"] = (...args) => this.giveaways.emitter.emit(...args)

    private async getChannel(channelID: Snowflake) {
        const cached = this.client.channels.cache.get(channelID)
        const chan = cached ?? (await this.client.channels.fetch(channelID).catch(() => null))
        return chan && chan.isTextBased() && "send" in chan ? chan : null
    }

    /**
     * Fetches the message of a giveaway.
     * @param channelID The id of the channel to pull message from.
     * @param messageID The id of the message to fetch.
     */
    public async fetchMessage(channelID: Snowflake, messageID?: Snowflake | null): Promise<Message | undefined> {
        if (!messageID || !/^\d{17,20}$/.test(messageID)) return
        const chan = await this.getChannel(channelID)
        if (!chan) return
        return chan.messages.cache.get(messageID) ?? (await chan.messages.fetch(messageID).catch(() => undefined))
    }

    private async getGuild(guildID: Snowflake): Promise<Guild | null> {
        return this.client.guilds.cache.get(guildID) ?? (await this.client.guilds.fetch(guildID).catch(() => null))
    }

    private clearTimers(id: Snowflake) {
        const f = this.#flushTimers.get(id)
        if (f) clearTimeout(f)
        this.#flushTimers.delete(id)
        const r = this.#refreshTimers.get(id)
        if (r) clearTimeout(r)
        this.#refreshTimers.delete(id)
    }

    /** Persists a giveaway now (inside its lock). */
    private async save(g: Giveaway) {
        const f = this.#flushTimers.get(g.id)
        if (f) clearTimeout(f)
        this.#flushTimers.delete(g.id)
        await Database.set(g)
    }

    /** Queues a coalesced write of entry changes. */
    private queueFlush(g: Giveaway) {
        const delay = this.giveaways.options.entryFlushDelay!
        if (delay <= 0) return this.save(g)
        if (this.#flushTimers.has(g.id)) return
        const t = setTimeout(() => {
            this.#flushTimers.delete(g.id)
            this.#lock.run(g.id, () => Database.set(g)).catch(noop)
        }, delay)
        t.unref?.()
        this.#flushTimers.set(g.id, t)
    }

    /** Queues a refresh of the giveaway message (live entry count). */
    private queueRefresh(g: Giveaway) {
        const { useDefault, showEntryCount } = this.giveaways.options
        if (!useDefault || !g.messageID || this.#refreshTimers.has(g.id)) return
        if (!showEntryCount) return
        const t = setTimeout(() => {
            this.#refreshTimers.delete(g.id)
            this.#lock.run(g.id, async () => {
                const cur = await Database.get(g.id)
                if (cur && !cur.hasEnded) await this.updateMessage(cur)
            }).catch(noop)
        }, this.giveaways.options.messageUpdateDelay)
        t.unref?.()
        this.#refreshTimers.set(g.id, t)
    }

    /** Writes every pending entry change to the database. */
    public async flushAll() {
        const ids = [...this.#flushTimers.keys()]
        for (const id of ids) {
            clearTimeout(this.#flushTimers.get(id)!)
            this.#flushTimers.delete(id)
        }
        await Promise.all(ids.map((id) => this.#lock.run(id, async () => {
            const g = await Database.get(id)
            if (g) await Database.set(g)
        }).catch(noop)))
    }

    /** Re-renders the default giveaway message. */
    private async updateMessage(g: Giveaway) {
        if (!this.giveaways.options.useDefault) return true
        const msg = await this.fetchMessage(g.channelID, g.messageID)
        if (!msg) {
            throwGiveawaysError(GiveawaysErrorType.MessageNotFound, g.id)
            return false
        }
        await msg.edit(this.renderer.payload(g)).catch(noop)
        return true
    }

    private schedule(g: Giveaway) {
        if (g.hasEnded || g.isPaused()) this.scheduler.cancel(g.id)
        else this.scheduler.schedule(g.id, g.endTimestamp())
    }

    // ----------------------------------------------------------------------
    // Life cycle
    // ----------------------------------------------------------------------

    /**
     * Starts a new giveaway on a guild. There is no upper limit on the duration.
     * @param options The start options for the giveaway.
     */
    public async start(options: IGiveawayStartOptions) {
        await this.#ready
        const winnersCount = Math.floor(Number(options.winnersCount))
        const duration = Math.floor(Number(options.duration))
        if (!Number.isFinite(duration) || duration <= 0) throw new RangeError("Giveaway duration must be a positive amount of time")
        if (!Number.isSafeInteger(Date.now() + duration)) throw new RangeError("Giveaway duration is too large")
        if (!Number.isFinite(winnersCount) || winnersCount < 1) throw new RangeError("Giveaway winners count must be at least 1")
        if (!options.prize?.trim()) throw new RangeError("Giveaway prize must not be empty")

        const giveaway = Database.create({ ...options, duration, winnersCount, prize: options.prize.trim() })
        if (giveaway.maxEntries != null && !(giveaway.maxEntries >= 1)) giveaway.maxEntries = null
        const { useDefault } = this.giveaways.options

        if (useDefault) {
            const chan = await this.getChannel(giveaway.channelID)
            const ping = giveaway.display?.pingRoleID
            const msg = await chan?.send({
                content: ping ? format(this.messages.startPing, { ping: `<@&${ping}>` }) : undefined,
                ...this.renderer.payload(giveaway),
                allowedMentions: { parse: [], roles: ping ? [ping] : [] },
            }).catch(noop)

            if (!msg) {
                throwGiveawaysError(GiveawaysErrorType.MessageNotDetermined, giveaway.id)
                return null
            }

            if (this.giveaways.options.useReactions) await msg.react(this.giveaways.options.emoji!).catch(noop)
            giveaway.messageID = msg.id
        }

        await Database.set(giveaway)
        this.schedule(giveaway)
        this.emit("giveawayStart", giveaway.clone())
        return giveaway
    }

    /**
     * Links a custom start message to a giveaway (used by the `giveawayStart`
     * event when default messages are disabled).
     */
    public async attachMessage(id: Snowflake, messageID: Snowflake) {
        return this.#lock.run(id, async () => {
            const g = await Database.get(id)
            if (!g) return null
            g.messageID = messageID
            await this.save(g)
            return g
        })
    }

    /** Removes a giveaway and its timers without announcing anything. */
    public async discard(id: Snowflake) {
        return this.#lock.run(id, async () => {
            this.scheduler.cancel(id)
            this.clearTimers(id)
            return await Database.delete(id)
        })
    }

    /**
     * Timer path for ending. If the bot is disconnected right at the deadline,
     * drawing now would find no members and end with no winners, so retry a
     * minute later instead. Manual `end()` calls are never postponed.
     */
    private async _onDeadline(id: Snowflake) {
        if (!this.client.isReady()) {
            this.scheduler.schedule(id, Date.now() + 60_000)
            return null
        }
        return this.end(id)
    }

    /**
     * Ends an existing giveaway and draws the winners.
     * @param id The id of the giveaway to end.
     */
    public async end(id: Snowflake) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || giveaway.hasEnded) return null

            this.scheduler.cancel(id)
            this.clearTimers(id)

            giveaway.winners = await this.drawWinners(giveaway, giveaway.winnersCount)
            giveaway.hasEnded = true
            giveaway.endedAt = Date.now()
            giveaway.pausedAt = null
            await this.save(giveaway)

            if (this.giveaways.options.useDefault) {
                const msg = await this.fetchMessage(giveaway.channelID, giveaway.messageID)
                if (msg) await msg.edit(this.renderer.payload(giveaway)).catch(noop)
                else throwGiveawaysError(GiveawaysErrorType.MessageNotFound, giveaway.id)

                await this.announce(giveaway, msg, giveaway.winners, "winners")
            }

            if (this.giveaways.options.dmWinners) this.dmWinners(giveaway, giveaway.winners).catch(noop)
            this.emit("giveawayEnd", giveaway.clone())
            return giveaway
        })
    }

    /**
     * Cancels a running giveaway: it ends without winners.
     */
    public async cancel(id: Snowflake) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || giveaway.hasEnded) return null

            this.scheduler.cancel(id)
            this.clearTimers(id)
            giveaway.hasEnded = true
            giveaway.cancelled = true
            giveaway.endedAt = Date.now()
            giveaway.pausedAt = null
            giveaway.winners = []
            await this.save(giveaway)
            await this.updateMessage(giveaway)

            this.emit("giveawayCancel", giveaway.clone())
            return giveaway
        })
    }

    /**
     * Rerolls an ended giveaway.
     * @param id The id of the giveaway to reroll.
     * @param unique Whether everyone who already won is excluded.
     * @param amount The amount of new winners (defaults to the winners count).
     */
    public async reroll(id: Snowflake, unique: boolean = false, amount?: number) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || !giveaway.hasEnded || giveaway.cancelled || !giveaway.entries.length) return null
            const oldGiveaway = giveaway.clone()
            const count = Math.floor(amount ?? giveaway.winnersCount)
            if (!(count >= 1)) return null

            const previous = [...new Set([...giveaway.previousWinners ?? [], ...giveaway.winners])]
            const newWinners = await this.drawWinners(giveaway, count, unique ? new Set(previous) : undefined)
            if (!newWinners.length) return null

            giveaway.previousWinners = previous
            giveaway.winners = newWinners
            await this.save(giveaway)

            if (this.giveaways.options.useDefault) {
                const msg = await this.fetchMessage(giveaway.channelID, giveaway.messageID)
                if (msg) await msg.edit(this.renderer.payload(giveaway)).catch(noop)
                await this.announce(giveaway, msg, newWinners, "reroll")
            }

            if (this.giveaways.options.dmWinners) this.dmWinners(giveaway, newWinners).catch(noop)
            this.emit("giveawayReroll", oldGiveaway, giveaway.clone())
            return giveaway
        })
    }

    /**
     * Edits a running giveaway.
     * @param id The id of the giveaway to edit.
     * @param options The options used to edit this giveaway.
     */
    public async edit(id: Snowflake, options: IGiveawayEditOptions) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || giveaway.hasEnded) return null
            const oldGiveaway = giveaway.clone()

            if (options.prize?.trim()) giveaway.prize = options.prize.trim()
            if (options.winnersCount != null && Math.floor(options.winnersCount) >= 1) giveaway.winnersCount = Math.floor(options.winnersCount)
            if (options.hostID) giveaway.hostID = options.hostID
            // Builder functions are additive, so merge instead of replacing:
            // "$setMinimumAccountAge[7d] $editGiveaway[...]" must not drop the required roles.
            if (options.requirements && Object.keys(options.requirements).length) giveaway.requirements = { ...giveaway.requirements, ...options.requirements }
            if (options.bonusEntries?.length) giveaway.bonusEntries = options.bonusEntries
            if (options.maxEntries !== undefined) giveaway.maxEntries = options.maxEntries && options.maxEntries >= 1 ? Math.floor(options.maxEntries) : null
            if (options.display && Object.keys(options.display).length) giveaway.display = { ...giveaway.display, ...options.display }

            await this.save(giveaway)
            await this.updateMessage(giveaway)
            this.emit("giveawayEdit", oldGiveaway, giveaway.clone())
            return giveaway
        })
    }

    /**
     * Adds (or with a negative value removes) time from a running giveaway.
     * Shortening never moves the end before "now"; the giveaway then ends immediately.
     */
    public async extend(id: Snowflake, ms: number) {
        await this.#ready
        if (!Number.isFinite(ms) || ms === 0) return null
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || giveaway.hasEnded) return null
            const oldGiveaway = giveaway.clone()

            const floor = (giveaway.pausedAt ?? Date.now()) - giveaway.timestamp
            const next = Math.max(giveaway.duration + Math.trunc(ms), floor)
            if (!Number.isSafeInteger(giveaway.timestamp + next)) return null
            giveaway.duration = next

            await this.save(giveaway)
            this.schedule(giveaway)
            await this.updateMessage(giveaway)
            this.emit("giveawayEdit", oldGiveaway, giveaway.clone())
            return giveaway
        })
    }

    /** Pauses a running giveaway: the timer stops and nobody can join or leave. */
    public async pause(id: Snowflake) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || giveaway.hasEnded || giveaway.isPaused()) return null

            giveaway.pausedAt = Date.now()
            this.scheduler.cancel(id)
            await this.save(giveaway)
            await this.updateMessage(giveaway)
            this.emit("giveawayPause", giveaway.clone())
            return giveaway
        })
    }

    /** Resumes a paused giveaway with the time it had left. */
    public async resume(id: Snowflake) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || !giveaway.isPaused()) return null

            giveaway.duration += Date.now() - giveaway.pausedAt!
            giveaway.pausedAt = null
            await this.save(giveaway)
            this.schedule(giveaway)
            await this.updateMessage(giveaway)
            this.emit("giveawayResume", giveaway.clone())
            return giveaway
        })
    }

    // ----------------------------------------------------------------------
    // Entries
    // ----------------------------------------------------------------------

    /**
     * Toggles a member's entry: joins if not entered, leaves otherwise.
     * Used by the button handler.
     */
    public async toggleEntry(id: Snowflake, member: GuildMember | Parameters<Giveaway["canEnter"]>[0], source: EntryContext, user: User): Promise<IEntryResult | null> {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway) return null
            const userID = member.user.id

            if (!giveaway.hasEnded && !giveaway.isPaused() && giveaway.hasEntered(userID)) {
                const old = giveaway.clone()
                giveaway.removeEntry(userID)
                await this.queueFlush(giveaway)
                this.queueRefresh(giveaway)
                this.emit("giveawayEntryRemove", old, giveaway.clone(), source, user)
                return { action: "removed", giveaway }
            }

            return this.#add(giveaway, member, source, user)
        })
    }

    /** Adds a member's entry (used by reactions). */
    public async join(id: Snowflake, member: GuildMember, source: EntryContext, user: User) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway) return null
            if (giveaway.hasEntered(member.id)) return { action: "added", giveaway } as IEntryResult
            return this.#add(giveaway, member, source, user)
        })
    }

    async #add(giveaway: Giveaway, member: Parameters<Giveaway["canEnter"]>[0], source: EntryContext, user: User): Promise<IEntryResult> {
        const reason = giveaway.denyReason(member, true)
        if (reason) {
            this.emit("giveawayEntryRevoke", giveaway.clone(), source, user, reason)
            return { action: "denied", reason, giveaway }
        }

        const old = giveaway.clone()
        giveaway.addEntry(member.user.id, giveaway.computeWeight(member))
        await this.queueFlush(giveaway)
        this.queueRefresh(giveaway)
        this.emit("giveawayEntryAdd", old, giveaway.clone(), source, user)
        return { action: "added", giveaway }
    }

    /**
     * Removes an entry. Returns the giveaway, or null if it was not entered/active.
     * @param force Also remove entries while paused or ended.
     */
    public async leave(id: Snowflake, userID: Snowflake, source?: EntryContext, user?: User, force = false) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || (!force && !giveaway.isActive()) || !giveaway.hasEntered(userID)) return null
            const old = giveaway.clone()
            giveaway.removeEntry(userID)
            await (force ? this.save(giveaway) : this.queueFlush(giveaway))
            this.queueRefresh(giveaway)
            if (source && user) this.emit("giveawayEntryRemove", old, giveaway.clone(), source, user)
            return giveaway
        })
    }

    /**
     * Adds an entry on someone's behalf.
     * @param bypassRequirements Skip requirement checks (still respects ended state).
     */
    public async addEntry(id: Snowflake, userID: Snowflake, bypassRequirements = false) {
        await this.#ready
        return this.#lock.run(id, async () => {
            const giveaway = await Database.get(id)
            if (!giveaway || giveaway.hasEnded || giveaway.hasEntered(userID)) return null

            const guild = await this.getGuild(giveaway.guildID)
            const member = await guild?.members.fetch(userID).catch(() => null)
            if (!member && !bypassRequirements) return null
            if (member && !bypassRequirements && giveaway.requirementDenyReason(member, true)) return null

            giveaway.addEntry(userID, member ? giveaway.computeWeight(member) : 1)
            await this.save(giveaway)
            this.queueRefresh(giveaway)
            return giveaway
        })
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
    private async drawWinners(g: Giveaway, count: number, exclude?: Set<string>) {
        const pool = exclude ? g.entries.filter((e) => !exclude.has(e)) : [...g.entries]
        if (!pool.length || count < 1) return []

        const guild = await this.getGuild(g.guildID)
        if (!guild) return []

        const weighted = !!g.bonusEntries?.length || !!(g.entryWeights && Object.keys(g.entryWeights).length)
        const order = weighted
            ? weightedOrder(pool, (id) => {
                const m = guild.members.cache.get(id)
                return m ? g.computeWeight(m) : g.weightOf(id)
            })
            : shuffle(pool)

        const winners: string[] = []
        let i = 0
        while (winners.length < count && i < order.length) {
            const need = count - winners.length
            const batch = order.slice(i, i + Math.min(100, Math.max(need * 2, 10)))
            i += batch.length

            const members = await this.fetchMembers(guild, batch)
            for (const id of batch) {
                const m = members.get(id)
                if (m && g.requirementDenyReason(m) === null) {
                    winners.push(id)
                    if (winners.length === count) break
                }
            }
        }

        return winners
    }

    private async fetchMembers(guild: Guild, ids: string[]) {
        const found = new Map<string, GuildMember>()
        const missing: string[] = []
        for (const id of ids) {
            const m = guild.members.cache.get(id)
            if (m) found.set(id, m)
            else missing.push(id)
        }
        if (!missing.length) return found

        const fetched = await guild.members.fetch({ user: missing, time: 15_000 }).catch(() => null)
        if (fetched) {
            for (const [id, m] of fetched) found.set(id, m)
        } else {
            // Gateway member requests can time out; fall back to REST.
            const results = await Promise.allSettled(missing.map((id) => guild.members.fetch(id)))
            for (const r of results) if (r.status === "fulfilled") found.set(r.value.id, r.value)
        }
        return found
    }

    private async announce(g: Giveaway, msg: Message | undefined, winners: string[], kind: "winners" | "reroll") {
        const chan = msg ? msg.channel : await this.getChannel(g.channelID)
        if (!chan || !("send" in chan)) return

        const m = this.messages
        const s = winners.length === 1 ? "" : "s"
        if (!winners.length) {
            await (msg
                ? msg.reply({ content: format(m.noWinners, { prize: g.prize }), allowedMentions: { parse: [], repliedUser: false } })
                : chan.send({ content: format(m.noWinners, { prize: g.prize }), allowedMentions: { parse: [] } })).catch(noop)
            return
        }

        const head = format(kind === "winners" ? m.winners : m.reroll, { prize: g.prize, s, mentions: "" })
        const room = Math.max(200, MAX_MESSAGE - head.length - 10)
        const groups = chunk(winners, 90)
        let first = true
        for (const group of groups) {
            for (const part of chunkJoin(group.map((id) => `<@${id}>`), ", ", room)) {
                const users = part.match(/\d{17,20}/g) ?? []
                const content = format(first ? (kind === "winners" ? m.winners : m.reroll) : m.winnersContinued, { prize: g.prize, s, mentions: part })
                const payload = { content: content.slice(0, MAX_MESSAGE), allowedMentions: { parse: [] as [], users, repliedUser: false } }
                await (first && msg ? msg.reply(payload) : chan.send(payload)).catch(noop)
                first = false
            }
        }
    }

    private async dmWinners(g: Giveaway, winners: string[]) {
        const guild = this.client.guilds.cache.get(g.guildID)
        const link = g.messageID ? `https://discord.com/channels/${g.guildID}/${g.channelID}/${g.messageID}` : ""
        const content = format(this.messages.winnerDM, { prize: g.prize, guild: guild?.name ?? "the server", link }).slice(0, MAX_MESSAGE)
        for (const id of winners) {
            const user = await this.client.users.fetch(id).catch(() => null)
            await user?.send({ content, allowedMentions: { parse: [] } }).catch(() => {})
        }
    }

    // ----------------------------------------------------------------------
    // Start-up and maintenance
    // ----------------------------------------------------------------------

    /** @internal Restores timers for active giveaways after a restart. */
    public async _restore() {
        if (this.#restored) return
        this.#restored = true
        for (const g of Database.activeGiveaways()) this.schedule(g)

        const keep = this.giveaways.options.deleteEndedAfter
        if (keep && keep > 0) {
            await this.sweep(keep).catch(noop)
            this.#sweepTimer = setInterval(() => this.sweep(keep).catch(noop), Math.min(keep, 6 * 36e5))
            this.#sweepTimer.unref?.()
        }
        Logger.info(`[ForgeGiveaways] Restored ${this.scheduler.size} active giveaway(s)`)
    }

    /** Deletes giveaways that ended more than `olderThan` ms ago. Returns how many. */
    public async sweep(olderThan: number) {
        const cutoff = Date.now() - olderThan
        const ended = await Database.find({ hasEnded: true })
        const stale = ended.filter((g) => (g.endedAt ?? g.endTimestamp()) < cutoff).map((g) => g.id)
        return Database.deleteMany(stale)
    }

    /** Stops all timers and writes pending changes. */
    public async destroy() {
        this.scheduler.clear()
        if (this.#sweepTimer) clearInterval(this.#sweepTimer)
        for (const t of this.#refreshTimers.values()) clearTimeout(t)
        this.#refreshTimers.clear()
        await this.flushAll()
    }
}
