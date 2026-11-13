import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { scopedGiveaway } from "../../functions/scope"

export default new NativeFunction({
    name: "$rerollGiveaway",
    version: "1.0.0",
    description: "Rerolls an ended giveaway, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to reroll",
            rest: false,
            required: true,
            type: ArgType.String,
        },
        {
            name: "unique",
            description: "Whether everyone who already won is excluded, defaults to false",
            rest: false,
            type: ArgType.Boolean,
        },
        {
            name: "amount",
            description: "The amount of new winners, defaults to the winners count",
            rest: false,
            type: ArgType.Number,
        },
        {
            name: "guild ID",
            description: "The guild the giveaway must belong to, defaults to the current guild",
            rest: false,
            type: ArgType.Guild,
        },
    ],
    output: ArgType.Boolean,
    async execute(ctx, [id, unique, amount, guild]) {
        if (amount != null && !(amount >= 1)) return this.customError("Amount must be at least 1")
        if (!(await scopedGiveaway(ctx, id, guild))) return this.success(false)
        const manager = ctx.client.getExtension(ForgeGiveaways, true).giveawaysManager
        const giveaway = await manager.reroll(id, !!unique, amount ?? undefined).catch(ctx.noop)
        return this.success(!!giveaway)
    }
})
