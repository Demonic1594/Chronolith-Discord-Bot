import { ArgType, NativeFunction } from "@tryforge/forgescript"
import pullGiveaway from "../../functions/pullGiveaway"
import array from "../../functions/array"

export default new NativeFunction({
    name: "$giveawayBonusEntries",
    version: "2.0.0",
    description: "Returns the bonus entry roles of a giveaway as roleID:amount",
    unwrap: true,
    brackets: false,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to pull data from",
            rest: false,
            required: true,
            type: ArgType.String,
        },
        {
            name: "separator",
            description: "The separator to use for each value",
            rest: false,
            type: ArgType.String,
        },
    ],
    output: array<ArgType.String>(),
    async execute(ctx, [id, sep]) {
        const giveaway = await pullGiveaway(ctx, id)
        return this.success(giveaway?.bonusEntries?.map((b) => `${b.roleID}:${b.amount}`).join(sep ?? ", "))
    }
})
