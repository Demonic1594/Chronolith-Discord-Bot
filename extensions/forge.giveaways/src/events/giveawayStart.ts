import { Interpreter } from "@tryforge/forgescript"
import { GiveawaysEventHandler } from "../handlers"
import { Context } from "../structures"
import { ForgeGiveaways } from ".."
import { GiveawaysErrorType, throwGiveawaysError } from "../functions/error"
import noop from "../functions/noop"

export default new GiveawaysEventHandler({
    name: "giveawayStart",
    version: "1.0.0",
    description: "This event is fired when a giveaway has started. With default messages disabled it must $return the ID of the giveaway message it sent",
    listener: async function (gw) {
        const client = this.getExtension(ForgeGiveaways, true)
        const manager = client.giveawaysManager
        const commands = client.commands.get("giveawayStart")
        const custom = !client.options.useDefault

        if (custom && commands.length !== 1) {
            await manager.discard(gw.id).catch(noop)
            throw new Error(commands.length ? GiveawaysErrorType.MultipleStartEvents : GiveawaysErrorType.MissingStartEvent)
        }

        if (!commands.length) return
        const command = commands[0]

        const ctx = new Context({
            obj: gw,
            command,
            client: this,
            states: { giveaway: { new: gw } },
            data: command.compiled.code,
            allowTopLevelReturn: true,
        })

        const result = await Promise.resolve(Interpreter.run(ctx)).catch(noop)
        if (!custom) return

        const msg = await manager.fetchMessage(gw.channelID, typeof result === "string" ? result.trim() : undefined)
        if (msg) {
            await manager.attachMessage(gw.id, msg.id)
        } else {
            throwGiveawaysError(GiveawaysErrorType.MessageNotDetermined, gw.id)
            await manager.discard(gw.id)
        }
    },
})
