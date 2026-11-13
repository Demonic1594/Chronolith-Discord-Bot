import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayEntryRevoke",
    version: "1.0.0",
    description: "This event is fired when someone tried to enter a giveaway but was refused; use $giveawayDenyReason for why",
    listener: async function (gw, obj, user, reason) {
        const revoked = gw.clone()
        ;(revoked as any).denyReasonCode = reason ?? null
        runEvent(this, "giveawayEntryRevoke", obj, { giveaway: { new: revoked }, user: { new: user } })
    },
})
