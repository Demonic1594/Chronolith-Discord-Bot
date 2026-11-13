import { ForgeClient } from "@tryforge/forgescript"
import { ButtonInteraction, MessageFlags, User } from "discord.js"
import { ForgeGiveaways } from ".."
import { Database, ENTRY_BUTTON_ID } from "../structures"
import { denyReasonText, format, GiveawayMessages } from "../structures/messages"
import { GiveawaysErrorType, throwGiveawaysError } from "../functions/error"
import noop from "../functions/noop"

/**
 * Handles clicks on the giveaway entry button (custom id `giveawayEntry`,
 * optionally followed by `-anything`). Clicking toggles the entry.
 */
export class GiveawaysInteractionHandler {
    public constructor(private readonly client: ForgeClient) {
        this.client.on("interactionCreate", (interaction) => {
            if (!interaction.isButton() || !interaction.inGuild()) return
            const [action] = interaction.customId.split("-")
            if (action !== ENTRY_BUTTON_ID) return
            this.handle(interaction).catch(noop)
        })
    }

    private async handle(interaction: ButtonInteraction<"cached" | "raw">) {
        const ext = this.client.getExtension(ForgeGiveaways, true)
        const { useDefault } = ext.options
        const m = ext.options.messages as GiveawayMessages
        const reply = (content: string) => useDefault
            ? interaction.reply({ content, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } }).catch(noop)
            : undefined

        if (!Database.ready) return reply(m.notReady)

        const giveaway = await Database.getByMessage(interaction.message.id, interaction.channelId)
        if (!giveaway) {
            throwGiveawaysError(GiveawaysErrorType.UnknownGiveaway, interaction.message.id)
            return reply(m.unknown)
        }
        if (giveaway.hasEnded) return reply(m.ended)
        if (giveaway.isPaused()) return reply(m.paused)

        const user = interaction.user as User
        const result = await ext.giveawaysManager.toggleEntry(giveaway.id, interaction.member, interaction, user)
        if (!result) return reply(m.unknown)

        switch (result.action) {
            case "added": {
                const w = result.giveaway.weightOf(user.id)
                return reply(format(m.joined, { prize: result.giveaway.prize, tickets: w > 1 ? ` (${w} entries)` : "" }))
            }
            case "removed":
                return reply(format(m.left, { prize: result.giveaway.prize }))
            case "denied":
                return reply(format(m.denied, { reason: denyReasonText(m, result.reason!) }))
        }
    }
}
