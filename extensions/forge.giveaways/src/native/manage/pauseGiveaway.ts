import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { scopedGiveaway } from "../../functions/scope"

export default new NativeFunction({
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
        const giveaway = await manager.pause(id).catch(ctx.noop)
        return this.success(!!giveaway)
    }
})
