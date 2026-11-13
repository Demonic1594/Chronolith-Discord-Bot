import { ButtonStyle, ColorResolvable, EmbedBuilder } from "discord.js";
import { Giveaway } from "./Giveaway";
import { GiveawayMessages } from "./messages";
export declare const ENTRY_BUTTON_ID = "giveawayEntry";
export interface IRendererOptions {
    emoji: string;
    buttonLabel: string;
    buttonStyle: ButtonStyle;
    showEntryCount: boolean;
    useReactions: boolean;
    colors: {
        active: ColorResolvable;
        paused: ColorResolvable;
        ended: ColorResolvable;
        cancelled: ColorResolvable;
    };
    messages: GiveawayMessages;
}
/**
 * Builds the default giveaway embeds and components. Kept separate from the
 * manager so start, edit, pause, resume and live entry counts all render
 * through one code path (the original duplicated the embed three times).
 */
export declare class Renderer {
    #private;
    private readonly opts;
    constructor(opts: IRendererOptions);
    /** Embed for an active or paused giveaway. */
    activeEmbed(g: Giveaway): EmbedBuilder;
    /** Embed for an ended or cancelled giveaway. */
    endedEmbed(g: Giveaway): EmbedBuilder;
    /** Entry button row, or nothing when reactions are used or the giveaway ended. */
    components(g: Giveaway): import("discord.js").APIActionRowComponent<import("discord.js").APIButtonComponent>[];
    /** Full payload for the giveaway message in its current state. */
    payload(g: Giveaway): {
        embeds: EmbedBuilder[];
        components: import("discord.js").APIActionRowComponent<import("discord.js").APIButtonComponent>[];
    };
}
//# sourceMappingURL=Renderer.d.ts.map