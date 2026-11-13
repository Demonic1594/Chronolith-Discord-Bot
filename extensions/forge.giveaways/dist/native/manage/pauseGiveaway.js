"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$pauseGiveaway",
    version: "2.0.0",
    description: "Pauses a running giveaway; the timer stops and entries are frozen, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to pause",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: forgescript_1.ArgType.Guild,
        },
    ],
    output: forgescript_1.ArgType.Boolean,
    async execute(ctx, [id, guild]) {
        if (!(await (0, scope_1.scopedGiveaway)(ctx, id, guild)))
            return this.success(false);
        const manager = ctx.client.getExtension(__1.ForgeGiveaways, true).giveawaysManager;
        const giveaway = await manager.pause(id).catch(ctx.noop);
        return this.success(!!giveaway);
    }
});
//# sourceMappingURL=pauseGiveaway.js.map