"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$removeGiveawayEntry",
    version: "2.0.0",
    description: "Removes a user's entry from a giveaway, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to remove the entry from",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
        {
            name: "user ID",
            description: "The user whose entry to remove",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.User,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: forgescript_1.ArgType.Guild,
        },
    ],
    output: forgescript_1.ArgType.Boolean,
    async execute(ctx, [id, user, guild]) {
        if (!(await (0, scope_1.scopedGiveaway)(ctx, id, guild)))
            return this.success(false);
        const manager = ctx.client.getExtension(__1.ForgeGiveaways, true).giveawaysManager;
        const giveaway = await manager.leave(id, user.id, undefined, undefined, true).catch(ctx.noop);
        return this.success(!!giveaway);
    }
});
//# sourceMappingURL=removeGiveawayEntry.js.map