import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { scopedGiveaway } from "../../functions/scope"

export default new NativeFunction({
    name: "$extendGiveaway",
    version: "2.0.0",
    description: "Adds time to a running giveaway, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to change",
            rest: false,
            required: true,
            type: ArgType.String,
        },
        {
            name: "time",
            description: "The amount of time, e.g. 1d",
            rest: false,
            required: true,
            type: ArgType.Time,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: ArgType.Guild,
        },
    ],
    output: ArgType.Boolean,
    async execute(ctx, [id, time, guild]) {
        if (!(time > 0)) return this.customError("Time must be greater than 0")
        if (!(await scopedGiveaway(ctx, id, guild))) return this.success(false)
        const manager = ctx.client.getExtension(ForgeGiveaways, true).giveawaysManager
        const giveaway = await manager.extend(id, time).catch(ctx.noop)
        return this.success(!!giveaway)
    }
})
