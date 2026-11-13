"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$deleteGiveaway",
    version: "1.0.0",
    description: "Deletes a giveaway from the database permanently (running ones stop without an announcement), returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to delete",
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
        // Through the manager so the end timer and pending writes are dropped too.
        const result = await ctx.client.getExtension(__1.ForgeGiveaways, true).giveawaysManager.discard(id);
        return this.success(result.affected === 1);
    }
});
//# sourceMappingURL=deleteGiveaway.js.map