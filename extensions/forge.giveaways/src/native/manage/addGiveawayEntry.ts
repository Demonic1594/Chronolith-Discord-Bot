import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { scopedGiveaway } from "../../functions/scope"

export default new NativeFunction({
    name: "$addGiveawayEntry",
    version: "2.0.0",
    description: "Enters a user into a running giveaway on their behalf, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to add the entry to",
            rest: false,
            required: true,
            type: ArgType.String,
        },
        {
            name: "user ID",
            description: "The user to enter",
            rest: false,
            required: true,
            type: ArgType.User,
        },
        {
            name: "bypass requirements",
            description: "Whether to skip the requirement checks, defaults to false",
            rest: false,
            type: ArgType.Boolean,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: ArgType.Guild,
        },
    ],
    output: ArgType.Boolean,
    async execute(ctx, [id, user, bypass, guild]) {
        if (!(await scopedGiveaway(ctx, id, guild))) return this.success(false)
        const manager = ctx.client.getExtension(ForgeGiveaways, true).giveawaysManager
        const giveaway = await manager.addEntry(id, user.id, !!bypass).catch(ctx.noop)
        return this.success(!!giveaway)
    }
})
