import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayReroll",
    version: "1.0.0",
    description: "This event is fired when a giveaway was rerolled",
    listener: async function (old, newer) {
        runEvent(this, "giveawayReroll", newer, { giveaway: { new: newer, old } })
    },
})
