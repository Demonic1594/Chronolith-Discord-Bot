import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayCancel",
    version: "2.0.0",
    description: "This event is fired when a giveaway was cancelled",
    listener: async function (gw) {
        runEvent(this, "giveawayCancel", gw, { giveaway: { new: gw } })
    },
})
