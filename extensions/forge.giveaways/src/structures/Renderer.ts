import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ColorResolvable,
    EmbedBuilder,
    resolveColor,
    time,
} from "discord.js"
import { Giveaway } from "./Giveaway"
import { format, GiveawayMessages } from "./messages"
import { formatDuration, truncate } from "../utils"

export const ENTRY_BUTTON_ID = "giveawayEntry"

export interface IRendererOptions {
    emoji: string
    buttonLabel: string
    buttonStyle: ButtonStyle
    showEntryCount: boolean
    useReactions: boolean
    colors: { active: ColorResolvable, paused: ColorResolvable, ended: ColorResolvable, cancelled: ColorResolvable }
    messages: GiveawayMessages
}

const roleList = (ids?: string[] | null) => ids?.map((id) => `<@&${id}>`).join(", ")

/**
 * Builds the default giveaway embeds and components. Kept separate from the
 * manager so start, edit, pause, resume and live entry counts all render
 * through one code path (the original duplicated the embed three times).
 */
export class Renderer {
    public constructor(private readonly opts: IRendererOptions) {}

    #details(g: Giveaway) {
        const req = g.requirements
        const lines: string[] = [`🎁 **Prize:** ${g.prize}`]
        if (g.display?.description) lines.push("", g.display.description, "")
        lines.push(`🏆 **Winners:** ${g.winnersCount}`)

        const extra: string[] = []
        const required = roleList(req?.requiredRoles)
        if (required) extra.push(`📌 **Required Role${req!.requiredRoles!.length === 1 ? "" : "s"}${req!.requiredRolesMode === "any" && req!.requiredRoles!.length > 1 ? " (any)" : ""}:** ${required}`)
        const restricted = roleList(req?.restrictedRoles)
        if (restricted) extra.push(`🚫 **Excluded Roles:** ${restricted}`)
        if (req?.minAccountAge) extra.push(`🗓️ **Min. Account Age:** ${formatDuration(req.minAccountAge)}`)
        if (req?.minMemberAge) extra.push(`🕰️ **Min. Time in Server:** ${formatDuration(req.minMemberAge)}`)
        if (g.bonusEntries?.length) {
            extra.push(`✨ **Bonus Entries:** ${g.bonusEntries.map((b) => `<@&${b.roleID}> +${b.amount}`).join(", ")}`)
        }
        if (g.maxEntries) extra.push(`👥 **Max Entries:** ${g.maxEntries}`)
        if (extra.length) lines.push("", ...extra)

        return lines.join("\n")
    }

    #base(g: Giveaway, color: ColorResolvable) {
        const embed = new EmbedBuilder()
            .setColor(g.display?.color ?? resolveColor(color))
            .setTimestamp(g.endTimestamp())
        if (g.display?.image) embed.setImage(g.display.image)
        if (g.display?.thumbnail) embed.setThumbnail(g.display.thumbnail)
        return embed
    }

    /** Embed for an active or paused giveaway. */
    public activeEmbed(g: Giveaway) {
        const m = this.opts.messages
        const paused = g.isPaused()
        const entryMethod = this.opts.useReactions ? "reaction" : "button"

        return this.#base(g, paused ? this.opts.colors.paused : this.opts.colors.active)
            .setTitle(paused ? m.pausedTitle : m.title)
            .setDescription(truncate(this.#details(g), 4096))
            .setFields(
                paused
                    ? { name: "Time Left", value: formatDuration(g.timeLeft()), inline: true }
                    : { name: "Ends", value: `${time(Math.floor(g.endTimestamp() / 1000), "R")} (${time(Math.floor(g.endTimestamp() / 1000), "f")})`, inline: true },
                { name: "Hosted by", value: `<@${g.hostID}>`, inline: true },
                // Only shown when it is kept up to date.
                ...(this.opts.showEntryCount ? [{ name: "Entries", value: `${g.entries.length}`, inline: true }] : []),
            )
            .setFooter({ text: truncate(paused ? m.pausedFooter : format(m.footer, { entryMethod }), 2048) })
    }

    /** Embed for an ended or cancelled giveaway. */
    public endedEmbed(g: Giveaway) {
        const m = this.opts.messages
        const winners = g.winners.map((id) => `<@${id}>`).join(", ")
        const lines = [`🎁 **Prize:** ${g.prize}`]
        if (!g.cancelled) lines.push(`🏆 **Winner${g.winners.length === 1 ? "" : "s"}:** ${winners || "None"}`)
        lines.push(`👥 **Total Entries:** ${g.entries.length}`)

        return this.#base(g, g.cancelled ? this.opts.colors.cancelled : this.opts.colors.ended)
            .setTitle(g.cancelled ? m.cancelledTitle : m.endedTitle)
            .setDescription(truncate(lines.join("\n"), 4096))
            .setFields(
                { name: "Ended", value: `${time(Math.floor((g.endedAt ?? Date.now()) / 1000), "R")}`, inline: true },
                { name: "Hosted by", value: `<@${g.hostID}>`, inline: true },
            )
            .setTimestamp(g.endedAt ?? Date.now())
            .setFooter({ text: truncate(g.cancelled ? m.cancelledFooter : m.endedFooter, 2048) })
    }

    /** Entry button row, or nothing when reactions are used or the giveaway ended. */
    public components(g: Giveaway) {
        if (this.opts.useReactions || g.hasEnded) return []
        const label = this.opts.showEntryCount ? `${this.opts.buttonLabel} (${g.entries.length})` : this.opts.buttonLabel
        const button = new ButtonBuilder()
            .setCustomId(ENTRY_BUTTON_ID)
            .setLabel(truncate(label, 80))
            .setStyle(this.opts.buttonStyle)
            .setDisabled(g.isPaused())
        if (this.opts.emoji) button.setEmoji(this.opts.emoji)
        return [new ActionRowBuilder<ButtonBuilder>().addComponents(button).toJSON()]
    }

    /** Full payload for the giveaway message in its current state. */
    public payload(g: Giveaway) {
        return {
            embeds: [g.hasEnded ? this.endedEmbed(g) : this.activeEmbed(g)],
            components: this.components(g),
        }
    }
}
