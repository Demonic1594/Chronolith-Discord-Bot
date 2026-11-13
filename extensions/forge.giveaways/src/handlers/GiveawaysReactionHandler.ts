import { ForgeClient, Logger } from "@tryforge/forgescript"
import { MessageReaction, PartialMessageReaction, PartialUser, Partials, User } from "discord.js"
import { ForgeGiveaways } from ".."
import { Database } from "../structures"
import noop from "../functions/noop"

/**
 * Handles reaction based entries. Reacting joins, removing the reaction
 * leaves. Members who don't meet the requirements get their reaction removed.
 */
export class GiveawaysReactionHandler {
    public constructor(private readonly client: ForgeClient) {
        const partials = client.options.partials ?? []
        if (!partials.includes(Partials.Message) || !partials.includes(Partials.Reaction)) {
            Logger.warn(`[ForgeGiveaways] Enable the "Message" and "Reaction" partials so reactions on giveaway messages sent before a restart are seen`)
        }

        client.on("messageReactionAdd", (r, u) => void this.add(r, u).catch(noop))
        client.on("messageReactionRemove", (r, u) => void this.remove(r, u).catch(noop))
    }

    private get ext() {
        return this.client.getExtension(ForgeGiveaways, true)
    }

    private matches(reaction: MessageReaction | PartialMessageReaction) {
        const want = this.ext.options.emoji!
        const { emoji } = reaction
        return emoji.name === want || emoji.id === want || emoji.toString() === want
    }

    private async add(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
        if (user.bot || !Database.ready || !this.matches(reaction)) return

        const giveaway = await Database.getByMessage(reaction.message.id, reaction.message.channelId)
        if (!giveaway) return
        if (!giveaway.isActive()) {
            reaction.users.remove(user.id).catch(noop)
            return
        }

        const guild = this.client.guilds.cache.get(giveaway.guildID)
        const member = guild?.members.cache.get(user.id) ?? (await guild?.members.fetch(user.id).catch(() => null))
        const full = user.partial ? await user.fetch().catch(() => null) : user
        if (!member || !full) {
            reaction.users.remove(user.id).catch(noop)
            return
        }

        const result = await this.ext.giveawaysManager.join(giveaway.id, member, reaction, full)
        if (result?.action === "denied") reaction.users.remove(user.id).catch(noop)
    }

    private async remove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
        if (user.bot || !Database.ready || !this.matches(reaction)) return

        const giveaway = await Database.getByMessage(reaction.message.id, reaction.message.channelId)
        // Only real participants leave: our own removal of a denied reaction
        // must not fire giveawayEntryRemove for somebody who never entered.
        if (!giveaway || !giveaway.isActive() || !giveaway.hasEntered(user.id)) return

        const full = user.partial ? await user.fetch().catch(() => null) : user
        await this.ext.giveawaysManager.leave(giveaway.id, user.id, reaction, full ?? undefined)
    }
}
