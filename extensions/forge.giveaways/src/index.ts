import { EventManager, ForgeClient, ForgeExtension, Logger } from "@tryforge/forgescript"
import { ButtonStyle, ColorResolvable } from "discord.js"
import { GiveawaysCommandManager, GiveawaysManager } from "./managers"
import { GiveawaysInteractionHandler, GiveawaysReactionHandler, IGiveawayEvents } from "./handlers"
import { TypedEmitter } from "tiny-typed-emitter"
import { TransformEvents } from "@tryforge/forge.db"
import { Database, DEFAULT_MESSAGES, GiveawayMessages } from "./structures"
import { GiveawaysErrorType } from "./functions/error"
import noop from "./functions/noop"
import { description, version } from "../package.json"

export interface IForgeGiveawaysOptions {
    /** The giveaway events to use. */
    events?: Array<keyof IGiveawayEvents>

    /** Whether to use the default giveaway messages. Defaults to `true`. */
    useDefault?: boolean

    /** Whether to use reactions for entering the giveaways. Defaults to `false`. */
    useReactions?: boolean

    /** Emoji on the entry button, or the reaction used for entering. Defaults to `🎉`. */
    emoji?: string

    /** Label of the entry button. Defaults to `Join`. */
    buttonLabel?: string

    /** Style of the entry button. Defaults to `ButtonStyle.Success`. */
    buttonStyle?: ButtonStyle

    /** Whether the entry button shows a live entry count, e.g. "Join (42)". Defaults to `true`. */
    showEntryCount?: boolean

    /** Whether winners get a direct message. Defaults to `false`. */
    dmWinners?: boolean

    /** Embed colors of the default messages. */
    colors?: { active?: ColorResolvable, paused?: ColorResolvable, ended?: ColorResolvable, cancelled?: ColorResolvable }

    /** Override any text of the default messages. See `DEFAULT_MESSAGES`. */
    messages?: Partial<GiveawayMessages>

    /**
     * Entry changes are written to the database at most once per this many ms
     * per giveaway, so a rush of clicks costs one write instead of hundreds.
     * `0` writes on every click. Defaults to `1000`.
     */
    entryFlushDelay?: number

    /** Minimum ms between refreshes of the live entry count. Defaults to `5000`. */
    messageUpdateDelay?: number

    /** Delete ended giveaways from the database this many ms after they ended. Off by default. */
    deleteEndedAfter?: number | null

    /** Flush pending writes on SIGINT/SIGTERM before the process exits. Defaults to `true`. */
    handleSignals?: boolean
}

export class ForgeGiveaways extends ForgeExtension {
    name = "forge.giveaways"
    description = description
    version = version
    requireExtensions = ["forge.db"]

    public emitter = new TypedEmitter<TransformEvents<IGiveawayEvents>>()

    public giveawaysManager!: GiveawaysManager
    public commands!: GiveawaysCommandManager

    public constructor(public readonly options: IForgeGiveawaysOptions = {}) {
        super()
        const o = this.options
        o.useDefault ??= true
        o.useReactions ??= false
        o.emoji ||= "🎉"
        o.buttonLabel ||= "Join"
        o.buttonStyle ??= ButtonStyle.Success
        o.showEntryCount ??= true
        o.dmWinners ??= false
        o.entryFlushDelay = Math.max(0, o.entryFlushDelay ?? 1000)
        o.messageUpdateDelay = Math.max(1000, o.messageUpdateDelay ?? 5000)
        o.handleSignals ??= true
        o.colors = { active: "Green", paused: "Yellow", ended: "Red", cancelled: "Grey", ...o.colors }
        o.messages = { ...DEFAULT_MESSAGES, ...o.messages }
    }

    public async init(client: ForgeClient) {
        this.commands = new GiveawaysCommandManager(client)

        EventManager.load("ForgeGiveawaysEvents", __dirname + "/events")
        this.load(__dirname + "/native")

        if (this.options.useReactions) {
            new GiveawaysReactionHandler(client)
            if (!client.options.intents.has("GuildMessageReactions")) {
                Logger.warn(`[ForgeGiveaways] Intent "GuildMessageReactions" must be defined for reactions to function`)
            }
        } else {
            new GiveawaysInteractionHandler(client)
        }

        if (this.options.events?.length) client.events.load("ForgeGiveawaysEvents", this.options.events)
        if (!this.options.useDefault && !this.options.events?.includes("giveawayStart")) {
            throw new Error(GiveawaysErrorType.MissingStartEvent)
        }

        // The manager exists right away; its methods wait for the database.
        this.giveawaysManager = new GiveawaysManager(client, this)
        if (this.options.handleSignals) this.#handleSignals()

        await new Database(this.emitter).init()
        this.giveawaysManager._onDatabaseReady()
    }

    #handleSignals() {
        for (const signal of ["SIGINT", "SIGTERM"] as const) {
            process.once(signal, () => {
                this.giveawaysManager.destroy().catch(noop).finally(() => {
                    // Re-raise with the default handler unless someone else handles it.
                    if (process.listenerCount(signal) === 0) process.kill(process.pid, signal)
                })
            })
        }
    }
}

export * from "./handlers"
export * from "./managers"
export * from "./structures"
export * from "./types"
export * from "./utils"
