import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayPause",
    version: "2.0.0",
    description: "This event is fired when a giveaway was paused",
    listener: async function (gw) {
        runEvent(this, "giveawayPause", gw, { giveaway: { new: gw } })
    },
})
