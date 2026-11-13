import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayEnd",
    version: "1.0.0",
    description: "This event is fired when a giveaway has ended",
    listener: async function (gw) {
        runEvent(this, "giveawayEnd", gw, { giveaway: { new: gw } })
    },
})
