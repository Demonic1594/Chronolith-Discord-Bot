import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { scopedGiveaway } from "../../functions/scope"

export default new NativeFunction({
    name: "$endGiveaway",
    version: "1.0.0",
    description: "Ends a running giveaway now and draws the winners, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to end",
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
        const manager = ctx.client.getExtension(ForgeGiveaways, true).giveawaysManager
        const giveaway = await manager.end(id).catch(ctx.noop)
        return this.success(!!giveaway)
    }
})
