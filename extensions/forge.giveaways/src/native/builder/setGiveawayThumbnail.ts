import { ArgType, NativeFunction } from "@tryforge/forgescript"
import builder from "../../functions/builder"

export default new NativeFunction({
    name: "$setGiveawayThumbnail",
    version: "2.0.0",
    description: "Sets the thumbnail of the default giveaway message",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "url",
            description: "The value to set",
            rest: false,
            required: true,
            type: ArgType.URL,
        },
    ],
    execute(ctx, [text]) {
        const b = builder(ctx)
        b.display = { ...b.display, thumbnail: text }
        return this.success()
    }
})
