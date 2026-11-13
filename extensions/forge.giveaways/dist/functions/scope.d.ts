import { Context } from "@tryforge/forgescript";
import { Guild } from "discord.js";
import { Giveaway } from "../structures";
/**
 * Loads a giveaway for a mutating function and enforces guild scoping:
 * a command running in guild A can't end, edit or delete a giveaway of
 * guild B just by knowing (or guessing) its ID. The explicit guild argument
 * wins; otherwise the guild of the current context is used. Contexts without
 * a guild (giveaway events, ready events) are unrestricted.
 */
export declare function scopedGiveaway(ctx: Context, id: string, guild?: Guild | null): Promise<Giveaway | null>;
//# sourceMappingURL=scope.d.ts.map