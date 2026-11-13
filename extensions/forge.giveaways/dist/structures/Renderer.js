"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = exports.ENTRY_BUTTON_ID = void 0;
const discord_js_1 = require("discord.js");
const messages_1 = require("./messages");
const utils_1 = require("../utils");
exports.ENTRY_BUTTON_ID = "giveawayEntry";
const roleList = (ids) => ids?.map((id) => `<@&${id}>`).join(", ");
/**
 * Builds the default giveaway embeds and components. Kept separate from the
 * manager so start, edit, pause, resume and live entry counts all render
 * through one code path (the original duplicated the embed three times).
 */
class Renderer {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    #details(g) {
        const req = g.requirements;
        const lines = [`🎁 **Prize:** ${g.prize}`];
        if (g.display?.description)
            lines.push("", g.display.description, "");
        lines.push(`🏆 **Winners:** ${g.winnersCount}`);
        const extra = [];
        const required = roleList(req?.requiredRoles);
        if (required)
            extra.push(`📌 **Required Role${req.requiredRoles.length === 1 ? "" : "s"}${req.requiredRolesMode === "any" && req.requiredRoles.length > 1 ? " (any)" : ""}:** ${required}`);
        const restricted = roleList(req?.restrictedRoles);
        if (restricted)
            extra.push(`🚫 **Excluded Roles:** ${restricted}`);
        if (req?.minAccountAge)
            extra.push(`🗓️ **Min. Account Age:** ${(0, utils_1.formatDuration)(req.minAccountAge)}`);
        if (req?.minMemberAge)
            extra.push(`🕰️ **Min. Time in Server:** ${(0, utils_1.formatDuration)(req.minMemberAge)}`);
        if (g.bonusEntries?.length) {
            extra.push(`✨ **Bonus Entries:** ${g.bonusEntries.map((b) => `<@&${b.roleID}> +${b.amount}`).join(", ")}`);
        }
        if (g.maxEntries)
            extra.push(`👥 **Max Entries:** ${g.maxEntries}`);
        if (extra.length)
            lines.push("", ...extra);
        return lines.join("\n");
    }
    #base(g, color) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(g.display?.color ?? (0, discord_js_1.resolveColor)(color))
            .setTimestamp(g.endTimestamp());
        if (g.display?.image)
            embed.setImage(g.display.image);
        if (g.display?.thumbnail)
            embed.setThumbnail(g.display.thumbnail);
        return embed;
    }
    /** Embed for an active or paused giveaway. */
    activeEmbed(g) {
        const m = this.opts.messages;
        const paused = g.isPaused();
        const entryMethod = this.opts.useReactions ? "reaction" : "button";
        return this.#base(g, paused ? this.opts.colors.paused : this.opts.colors.active)
            .setTitle(paused ? m.pausedTitle : m.title)
            .setDescription((0, utils_1.truncate)(this.#details(g), 4096))
            .setFields(paused
            ? { name: "Time Left", value: (0, utils_1.formatDuration)(g.timeLeft()), inline: true }
            : { name: "Ends", value: `${(0, discord_js_1.time)(Math.floor(g.endTimestamp() / 1000), "R")} (${(0, discord_js_1.time)(Math.floor(g.endTimestamp() / 1000), "f")})`, inline: true }, { name: "Hosted by", value: `<@${g.hostID}>`, inline: true }, 
        // Only shown when it is kept up to date.
        ...(this.opts.showEntryCount ? [{ name: "Entries", value: `${g.entries.length}`, inline: true }] : []))
            .setFooter({ text: (0, utils_1.truncate)(paused ? m.pausedFooter : (0, messages_1.format)(m.footer, { entryMethod }), 2048) });
    }
    /** Embed for an ended or cancelled giveaway. */
    endedEmbed(g) {
        const m = this.opts.messages;
        const winners = g.winners.map((id) => `<@${id}>`).join(", ");
        const lines = [`🎁 **Prize:** ${g.prize}`];
        if (!g.cancelled)
            lines.push(`🏆 **Winner${g.winners.length === 1 ? "" : "s"}:** ${winners || "None"}`);
        lines.push(`👥 **Total Entries:** ${g.entries.length}`);
        return this.#base(g, g.cancelled ? this.opts.colors.cancelled : this.opts.colors.ended)
            .setTitle(g.cancelled ? m.cancelledTitle : m.endedTitle)
            .setDescription((0, utils_1.truncate)(lines.join("\n"), 4096))
            .setFields({ name: "Ended", value: `${(0, discord_js_1.time)(Math.floor((g.endedAt ?? Date.now()) / 1000), "R")}`, inline: true }, { name: "Hosted by", value: `<@${g.hostID}>`, inline: true })
            .setTimestamp(g.endedAt ?? Date.now())
            .setFooter({ text: (0, utils_1.truncate)(g.cancelled ? m.cancelledFooter : m.endedFooter, 2048) });
    }
    /** Entry button row, or nothing when reactions are used or the giveaway ended. */
    components(g) {
        if (this.opts.useReactions || g.hasEnded)
            return [];
        const label = this.opts.showEntryCount ? `${this.opts.buttonLabel} (${g.entries.length})` : this.opts.buttonLabel;
        const button = new discord_js_1.ButtonBuilder()
            .setCustomId(exports.ENTRY_BUTTON_ID)
            .setLabel((0, utils_1.truncate)(label, 80))
            .setStyle(this.opts.buttonStyle)
            .setDisabled(g.isPaused());
        if (this.opts.emoji)
            button.setEmoji(this.opts.emoji);
        return [new discord_js_1.ActionRowBuilder().addComponents(button).toJSON()];
    }
    /** Full payload for the giveaway message in its current state. */
    payload(g) {
        return {
            embeds: [g.hasEnded ? this.endedEmbed(g) : this.activeEmbed(g)],
            components: this.components(g),
        };
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map