import { ArgType, NativeFunction } from "@tryforge/forgescript"
import pullGiveaway from "../../functions/pullGiveaway"

export default new NativeFunction({
    name: "$giveawayEntryWeight",
    version: "2.0.0",
    description: "Returns how many tickets a user's entry counts for (0 if not entered)",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "giveaway ID",
            description: "The giveaway to check",
            rest: false,
            required: true,
            type: ArgType.String,
        },
        {
            name: "user ID",
            description: "The user to check for",
            rest: false,
            required: true,
            type: ArgType.User,
        },
    ],
    output: ArgType.Number,
    async execute(ctx, [id, user]) {
        const giveaway = await pullGiveaway(ctx, id)
        return this.success(giveaway ? (giveaway.hasEntered(user.id) ? giveaway.weightOf(user.id) : 0) : undefined)
    }
})
