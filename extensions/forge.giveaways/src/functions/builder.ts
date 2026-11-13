import { Context } from "@tryforge/forgescript"
import { IGiveawayBuilder } from "../structures/Context"

/** Returns the giveaway builder of a context, creating it on first use. */
export default function builder(ctx: Context): IGiveawayBuilder {
    return (ctx.giveawayBuilder ??= {})
}

/** Returns the requirements of a context, creating them on first use. */
export function requirements(ctx: Context) {
    return (ctx.requirements ??= {})
}
