import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayResume",
    version: "2.0.0",
    description: "This event is fired when a paused giveaway was resumed",
    listener: async function (gw) {
        runEvent(this, "giveawayResume", gw, { giveaway: { new: gw } })
    },
})
