"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$editGiveaway",
    version: "1.1.0",
    description: "Edits a running giveaway, returns bool. Requirements, bonus entries and display options set before this call are applied too",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to edit",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
        {
            name: "guild ID",
            description: "The guild this giveaway is hosted on",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Guild,
        },
        {
            name: "host ID",
            description: "The new member hosting this giveaway",
            rest: false,
            type: forgescript_1.ArgType.Member,
            pointer: 1,
        },
        {
            name: "prize",
            description: "The new prize for this giveaway",
            rest: false,
            type: forgescript_1.ArgType.String
        },
        {
            name: "winners",
            description: "The new winners count for this giveaway",
            rest: false,
            type: forgescript_1.ArgType.Number
        }
    ],
    output: forgescript_1.ArgType.Boolean,
    async execute(ctx, [id, guild, host, prize, winners]) {
        if (winners != null && !(Number.isInteger(winners) && winners >= 1))
            return this.customError("Winners must be a whole number of at least 1");
        // The guild argument used to only resolve the host; it now also has
        // to match the giveaway, so one guild can't edit another's giveaway.
        if (!(await (0, scope_1.scopedGiveaway)(ctx, id, guild)))
            return this.success(false);
        const client = ctx.client.getExtension(__1.ForgeGiveaways, true);
        const b = ctx.giveawayBuilder;
        const giveaway = await client.giveawaysManager.edit(id, {
            hostID: host?.id,
            prize: prize || undefined,
            winnersCount: winners ?? undefined,
            requirements: ctx.requirements,
            bonusEntries: b?.bonusEntries,
            maxEntries: b?.maxEntries,
            display: b?.display,
        }).catch(ctx.noop);
        return this.success(!!giveaway);
    }
});
//# sourceMappingURL=editGiveaway.js.map