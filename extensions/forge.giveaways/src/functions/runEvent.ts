import { ForgeClient, Interpreter } from "@tryforge/forgescript"
import { ForgeGiveaways } from ".."
import { Context } from "../structures/Context"
import type { IGiveawayEvents } from "../handlers/GiveawaysEventHandler"
import type { ExtendedSendable, ExtendedStates } from "../types"
import noop from "./noop"

/**
 * Runs every command registered for a giveaway event. A failing command is
 * logged and does not stop the others.
 */
export default function runEvent(client: ForgeClient, name: keyof IGiveawayEvents, obj: ExtendedSendable, states?: ExtendedStates) {
    const commands = client.getExtension(ForgeGiveaways, true).commands.get(name)
    for (const command of commands) {
        const ctx = new Context({ obj, command, client, states, data: command.compiled.code })
        Promise.resolve(Interpreter.run(ctx)).catch(noop)
    }
}
