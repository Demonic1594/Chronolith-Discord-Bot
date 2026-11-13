import { Context } from "@tryforge/forgescript"
import { Guild } from "discord.js"
import { Database, Giveaway } from "../structures"
import { GiveawaysErrorType, throwGiveawaysError } from "./error"

/**
 * Loads a giveaway for a mutating function and enforces guild scoping:
 * a command running in guild A can't end, edit or delete a giveaway of
 * guild B just by knowing (or guessing) its ID. The explicit guild argument
 * wins; otherwise the guild of the current context is used. Contexts without
 * a guild (giveaway events, ready events) are unrestricted.
 */
export async function scopedGiveaway(ctx: Context, id: string, guild?: Guild | null): Promise<Giveaway | null> {
    const g = await Database.get(id)
    if (!g) return null
    const scope = guild?.id ?? ctx.guild?.id
    if (scope && g.guildID !== scope) {
        throwGiveawaysError(GiveawaysErrorType.WrongGuild, id)
        return null
    }
    return g
}
