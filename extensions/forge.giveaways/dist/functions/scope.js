"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scopedGiveaway = scopedGiveaway;
const structures_1 = require("../structures");
const error_1 = require("./error");
/**
 * Loads a giveaway for a mutating function and enforces guild scoping:
 * a command running in guild A can't end, edit or delete a giveaway of
 * guild B just by knowing (or guessing) its ID. The explicit guild argument
 * wins; otherwise the guild of the current context is used. Contexts without
 * a guild (giveaway events, ready events) are unrestricted.
 */
async function scopedGiveaway(ctx, id, guild) {
    const g = await structures_1.Database.get(id);
    if (!g)
        return null;
    const scope = guild?.id ?? ctx.guild?.id;
    if (scope && g.guildID !== scope) {
        (0, error_1.throwGiveawaysError)(error_1.GiveawaysErrorType.WrongGuild, id);
        return null;
    }
    return g;
}
//# sourceMappingURL=scope.js.map