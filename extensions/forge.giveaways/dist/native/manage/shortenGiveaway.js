"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$shortenGiveaway",
    version: "2.0.0",
    description: "Removes time from a running giveaway; it ends right away if no time is left, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to change",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
        {
            name: "time",
            description: "The amount of time, e.g. 1d",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Time,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: forgescript_1.ArgType.Guild,
        },
    ],
    output: forgescript_1.ArgType.Boolean,
    async execute(ctx, [id, time, guild]) {
        if (!(time > 0))
            return this.customError("Time must be greater than 0");
        if (!(await (0, scope_1.scopedGiveaway)(ctx, id, guild)))
            return this.success(false);
        const manager = ctx.client.getExtension(__1.ForgeGiveaways, true).giveawaysManager;
        const giveaway = await manager.extend(id, -time).catch(ctx.noop);
        return this.success(!!giveaway);
    }
});
//# sourceMappingURL=shortenGiveaway.js.map