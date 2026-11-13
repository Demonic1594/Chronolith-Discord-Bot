"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveawaysReactionHandler = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const discord_js_1 = require("discord.js");
const __1 = require("..");
const structures_1 = require("../structures");
const noop_1 = __importDefault(require("../functions/noop"));
/**
 * Handles reaction based entries. Reacting joins, removing the reaction
 * leaves. Members who don't meet the requirements get their reaction removed.
 */
class GiveawaysReactionHandler {
    client;
    constructor(client) {
        this.client = client;
        const partials = client.options.partials ?? [];
        if (!partials.includes(discord_js_1.Partials.Message) || !partials.includes(discord_js_1.Partials.Reaction)) {
            forgescript_1.Logger.warn(`[ForgeGiveaways] Enable the "Message" and "Reaction" partials so reactions on giveaway messages sent before a restart are seen`);
        }
        client.on("messageReactionAdd", (r, u) => void this.add(r, u).catch(noop_1.default));
        client.on("messageReactionRemove", (r, u) => void this.remove(r, u).catch(noop_1.default));
    }
    get ext() {
        return this.client.getExtension(__1.ForgeGiveaways, true);
    }
    matches(reaction) {
        const want = this.ext.options.emoji;
        const { emoji } = reaction;
        return emoji.name === want || emoji.id === want || emoji.toString() === want;
    }
    async add(reaction, user) {
        if (user.bot || !structures_1.Database.ready || !this.matches(reaction))
            return;
        const giveaway = await structures_1.Database.getByMessage(reaction.message.id, reaction.message.channelId);
        if (!giveaway)
            return;
        if (!giveaway.isActive()) {
            reaction.users.remove(user.id).catch(noop_1.default);
            return;
        }
        const guild = this.client.guilds.cache.get(giveaway.guildID);
        const member = guild?.members.cache.get(user.id) ?? (await guild?.members.fetch(user.id).catch(() => null));
        const full = user.partial ? await user.fetch().catch(() => null) : user;
        if (!member || !full) {
            reaction.users.remove(user.id).catch(noop_1.default);
            return;
        }
        const result = await this.ext.giveawaysManager.join(giveaway.id, member, reaction, full);
        if (result?.action === "denied")
            reaction.users.remove(user.id).catch(noop_1.default);
    }
    async remove(reaction, user) {
        if (user.bot || !structures_1.Database.ready || !this.matches(reaction))
            return;
        const giveaway = await structures_1.Database.getByMessage(reaction.message.id, reaction.message.channelId);
        // Only real participants leave: our own removal of a denied reaction
        // must not fire giveawayEntryRemove for somebody who never entered.
        if (!giveaway || !giveaway.isActive() || !giveaway.hasEntered(user.id))
            return;
        const full = user.partial ? await user.fetch().catch(() => null) : user;
        await this.ext.giveawaysManager.leave(giveaway.id, user.id, reaction, full ?? undefined);
    }
}
exports.GiveawaysReactionHandler = GiveawaysReactionHandler;
//# sourceMappingURL=GiveawaysReactionHandler.js.map