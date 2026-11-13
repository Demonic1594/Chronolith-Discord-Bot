import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { scopedGiveaway } from "../../functions/scope"

export default new NativeFunction({
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
            type: ArgType.String,
        },
        {
            name: "user ID",
            description: "The user whose entry to remove",
            rest: false,
            required: true,
            type: ArgType.User,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: ArgType.Guild,
        },
    ],
    output: ArgType.Boolean,
    async execute(ctx, [id, user, guild]) {
        if (!(await scopedGiveaway(ctx, id, guild))) return this.success(false)
        const manager = ctx.client.getExtension(ForgeGiveaways, true).giveawaysManager
        const giveaway = await manager.leave(id, user.id, undefined, undefined, true).catch(ctx.noop)
        return this.success(!!giveaway)
    }
})
