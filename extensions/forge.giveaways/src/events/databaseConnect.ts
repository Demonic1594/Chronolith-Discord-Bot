import { GiveawaysEventHandler } from "../handlers"
import runEvent from "../functions/runEvent"

export default new GiveawaysEventHandler({
    name: "databaseConnect",
    version: "1.0.0",
    description: "This event is fired when the database has connected",
    listener: async function () {
        runEvent(this, "databaseConnect", {})
    },
})
