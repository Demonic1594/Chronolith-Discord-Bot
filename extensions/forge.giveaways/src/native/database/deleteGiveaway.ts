import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { scopedGiveaway } from "../../functions/scope"

export default new NativeFunction({
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
            type: ArgType.String,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: ArgType.Guild,
        },
    ],
    output: ArgType.Boolean,
    async execute(ctx, [id, guild]) {
        if (!(await scopedGiveaway(ctx, id, guild))) return this.success(false)
        // Through the manager so the end timer and pending writes are dropped too.
        const result = await ctx.client.getExtension(ForgeGiveaways, true).giveawaysManager.discard(id)
        return this.success(result.affected === 1)
    }
})
