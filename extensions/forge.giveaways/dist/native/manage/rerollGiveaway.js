"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$rerollGiveaway",
    version: "1.0.0",
    description: "Rerolls an ended giveaway, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to reroll",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
        {
            name: "unique",
            description: "Whether everyone who already won is excluded, defaults to false",
            rest: false,
            type: forgescript_1.ArgType.Boolean,
        },
        {
            name: "amount",
            description: "The amount of new winners, defaults to the winners count",
            rest: false,
            type: forgescript_1.ArgType.Number,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: forgescript_1.ArgType.Guild,
        },
    ],
    output: forgescript_1.ArgType.Boolean,
    async execute(ctx, [id, unique, amount, guild]) {
        if (amount != null && !(amount >= 1))
            return this.customError("Amount must be at least 1");
        if (!(await (0, scope_1.scopedGiveaway)(ctx, id, guild)))
            return this.success(false);
        const manager = ctx.client.getExtension(__1.ForgeGiveaways, true).giveawaysManager;
        const giveaway = await manager.reroll(id, !!unique, amount ?? undefined).catch(ctx.noop);
        return this.success(!!giveaway);
    }
});
//# sourceMappingURL=rerollGiveaway.js.map