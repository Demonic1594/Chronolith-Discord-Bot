import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayEntryAdd",
    version: "1.0.0",
    description: "This event is fired when a giveaway entry is added",
    listener: async function (old, newer, obj, user) {
        runEvent(this, "giveawayEntryAdd", obj, { giveaway: { new: newer, old }, user: { new: user } })
    },
})
