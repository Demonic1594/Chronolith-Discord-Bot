import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayEdit",
    version: "1.1.0",
    description: "This event is fired when a giveaway was edited or its duration changed",
    listener: async function (old, newer) {
        runEvent(this, "giveawayEdit", newer, { giveaway: { new: newer, old } })
    },
})
