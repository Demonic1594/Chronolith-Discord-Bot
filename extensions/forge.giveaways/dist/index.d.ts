import { ForgeClient, ForgeExtension } from "@tryforge/forgescript";
import { ButtonStyle, ColorResolvable } from "discord.js";
import { GiveawaysCommandManager, GiveawaysManager } from "./managers";
import { IGiveawayEvents } from "./handlers";
import { TypedEmitter } from "tiny-typed-emitter";
import { TransformEvents } from "@tryforge/forge.db";
import { GiveawayMessages } from "./structures";
export interface IForgeGiveawaysOptions {
    /** The giveaway events to use. */
    events?: Array<keyof IGiveawayEvents>;
    /** Whether to use the default giveaway messages. Defaults to `true`. */
    useDefault?: boolean;
    /** Whether to use reactions for entering the giveaways. Defaults to `false`. */
    useReactions?: boolean;
    /** Emoji on the entry button, or the reaction used for entering. Defaults to `🎉`. */
    emoji?: string;
    /** Label of the entry button. Defaults to `Join`. */
    buttonLabel?: string;
    /** Style of the entry button. Defaults to `ButtonStyle.Success`. */
    buttonStyle?: ButtonStyle;
    /** Whether the entry button shows a live entry count, e.g. "Join (42)". Defaults to `true`. */
    showEntryCount?: boolean;
    /** Whether winners get a direct message. Defaults to `false`. */
    dmWinners?: boolean;
    /** Embed colors of the default messages. */
    colors?: {
        active?: ColorResolvable;
        paused?: ColorResolvable;
        ended?: ColorResolvable;
        cancelled?: ColorResolvable;
    };
    /** Override any text of the default messages. See `DEFAULT_MESSAGES`. */
    messages?: Partial<GiveawayMessages>;
    /**
     * Entry changes are written to the database at most once per this many ms
     * per giveaway, so a rush of clicks costs one write instead of hundreds.
     * `0` writes on every click. Defaults to `1000`.
     */
    entryFlushDelay?: number;
    /** Minimum ms between refreshes of the live entry count. Defaults to `5000`. */
    messageUpdateDelay?: number;
    /** Delete ended giveaways from the database this many ms after they ended. Off by default. */
    deleteEndedAfter?: number | null;
    /** Flush pending writes on SIGINT/SIGTERM before the process exits. Defaults to `true`. */
    handleSignals?: boolean;
}
export declare class ForgeGiveaways extends ForgeExtension {
    #private;
    readonly options: IForgeGiveawaysOptions;
    name: string;
    description: string;
    version: string;
    requireExtensions: string[];
    emitter: TypedEmitter<TransformEvents<IGiveawayEvents>>;
    giveawaysManager: GiveawaysManager;
    commands: GiveawaysCommandManager;
    constructor(options?: IForgeGiveawaysOptions);
    init(client: ForgeClient): Promise<void>;
}
export * from "./handlers";
export * from "./managers";
export * from "./structures";
export * from "./types";
export * from "./utils";
//# sourceMappingURL=index.d.ts.map