import { ArgType, NativeFunction } from "@tryforge/forgescript"
import builder from "../../functions/builder"

export default new NativeFunction({
    name: "$setGiveawayColor",
    version: "2.0.0",
    description: "Sets the embed color of the default giveaway message",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "color",
            description: "The color, e.g. #ff00ff",
            rest: false,
            required: true,
            type: ArgType.Color,
        },
    ],
    execute(ctx, [color]) {
        const b = builder(ctx)
        b.display = { ...b.display, color }
        return this.success()
    }
})
