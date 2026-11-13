import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { GiveawayDenyReason } from "../../structures"

export default new NativeFunction({
    name: "$giveawayDenyReason",
    version: "2.0.0",
    description: "Returns why an entry was refused, inside the giveawayEntryRevoke event",
    unwrap: false,
    output: GiveawayDenyReason,
    execute(ctx) {
        const g = ctx.extendedStates?.giveaway?.new as { denyReasonCode?: string } | undefined
        return this.success(g?.denyReasonCode ?? undefined)
    }
})
