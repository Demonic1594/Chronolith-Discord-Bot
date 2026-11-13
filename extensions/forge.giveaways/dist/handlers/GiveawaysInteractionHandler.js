"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveawaysInteractionHandler = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const structures_1 = require("../structures");
const messages_1 = require("../structures/messages");
const error_1 = require("../functions/error");
const noop_1 = __importDefault(require("../functions/noop"));
/**
 * Handles clicks on the giveaway entry button (custom id `giveawayEntry`,
 * optionally followed by `-anything`). Clicking toggles the entry.
 */
class GiveawaysInteractionHandler {
    client;
    constructor(client) {
        this.client = client;
        this.client.on("interactionCreate", (interaction) => {
            if (!interaction.isButton() || !interaction.inGuild())
                return;
            const [action] = interaction.customId.split("-");
            if (action !== structures_1.ENTRY_BUTTON_ID)
                return;
            this.handle(interaction).catch(noop_1.default);
        });
    }
    async handle(interaction) {
        const ext = this.client.getExtension(__1.ForgeGiveaways, true);
        const { useDefault } = ext.options;
        const m = ext.options.messages;
        const reply = (content) => useDefault
            ? interaction.reply({ content, flags: discord_js_1.MessageFlags.Ephemeral, allowedMentions: { parse: [] } }).catch(noop_1.default)
            : undefined;
        if (!structures_1.Database.ready)
            return reply(m.notReady);
        const giveaway = await structures_1.Database.getByMessage(interaction.message.id, interaction.channelId);
        if (!giveaway) {
            (0, error_1.throwGiveawaysError)(error_1.GiveawaysErrorType.UnknownGiveaway, interaction.message.id);
            return reply(m.unknown);
        }
        if (giveaway.hasEnded)
            return reply(m.ended);
        if (giveaway.isPaused())
            return reply(m.paused);
        const user = interaction.user;
        const result = await ext.giveawaysManager.toggleEntry(giveaway.id, interaction.member, interaction, user);
        if (!result)
            return reply(m.unknown);
        switch (result.action) {
            case "added": {
                const w = result.giveaway.weightOf(user.id);
                return reply((0, messages_1.format)(m.joined, { prize: result.giveaway.prize, tickets: w > 1 ? ` (${w} entries)` : "" }));
            }
            case "removed":
                return reply((0, messages_1.format)(m.left, { prize: result.giveaway.prize }));
            case "denied":
                return reply((0, messages_1.format)(m.denied, { reason: (0, messages_1.denyReasonText)(m, result.reason) }));
        }
    }
}
exports.GiveawaysInteractionHandler = GiveawaysInteractionHandler;
//# sourceMappingURL=GiveawaysInteractionHandler.js.map