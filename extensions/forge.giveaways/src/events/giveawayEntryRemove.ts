import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "giveawayEntryRemove",
    version: "1.0.0",
    description: "This event is fired when a giveaway entry is removed",
    listener: async function (old, newer, obj, user) {
        runEvent(this, "giveawayEntryRemove", obj, { giveaway: { new: newer, old }, user: { new: user } })
    },
})
