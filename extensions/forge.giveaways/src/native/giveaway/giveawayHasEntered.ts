import { ArgType, NativeFunction } from "@tryforge/forgescript"
import pullGiveaway from "../../functions/pullGiveaway"

export default new NativeFunction({
    name: "$giveawayHasEntered",
    version: "2.0.0",
    description: "Returns whether a user has entered a giveaway",
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
    output: ArgType.Boolean,
    async execute(ctx, [id, user]) {
        const giveaway = await pullGiveaway(ctx, id)
        return this.success(giveaway ? giveaway.hasEntered(user.id) : undefined)
    }
})
