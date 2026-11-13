import { GiveawayDenyReason } from "./Giveaway"

/**
 * Texts used by the default messages. Override any of them through the
 * `messages` option. Placeholders in braces are replaced at send time:
 * `{prize}`, `{mentions}`, `{count}`, `{s}` (plural suffix), `{reason}`,
 * `{guild}`, `{link}`, `{host}`, `{tickets}`.
 */
export const DEFAULT_MESSAGES = {
    title: "🎉 GIVEAWAY 🎉",
    pausedTitle: "⏸️ GIVEAWAY PAUSED ⏸️",
    endedTitle: "🎉 GIVEAWAY ENDED 🎉",
    cancelledTitle: "🚫 GIVEAWAY CANCELLED 🚫",
    footer: "Click the {entryMethod} below to join!",
    pausedFooter: "Entries are paused",
    endedFooter: "Thanks for participating!",
    cancelledFooter: "This giveaway was cancelled",
    startPing: "{ping} 🎉 A new giveaway has started!",
    joined: "✅ You joined the giveaway for **{prize}**!{tickets}",
    left: "👋 You left the giveaway for **{prize}**.",
    denied: "❌ You can't enter this giveaway: {reason}",
    ended: "⌛ This giveaway has already ended.",
    paused: "⏸️ This giveaway is paused right now, please try again later.",
    unknown: "❓ This giveaway no longer exists.",
    notReady: "⏳ Giveaways are still loading, please try again in a moment.",
    winners: "🎉 Congratulations to the winner{s} of **{prize}**!\n🏆 {mentions}",
    winnersContinued: "🏆 {mentions}",
    noWinners: "😢 There were no valid entries, so **{prize}** has no winners.",
    reroll: "🔁 Rerolled! Congratulations to the new winner{s} of **{prize}**!\n🏆 {mentions}",
    winnerDM: "🎉 You won **{prize}** in **{guild}**!\n{link}",
    reasonMissingRoles: "you don't have the required role(s).",
    reasonRestrictedRole: "one of your roles is not allowed to enter.",
    reasonRestrictedMember: "you are not allowed to enter.",
    reasonAccountTooNew: "your Discord account is too new.",
    reasonMemberTooNew: "you joined this server too recently.",
    reasonEntriesFull: "the maximum number of entries has been reached.",
    reasonEnded: "it has already ended.",
    reasonPaused: "it is paused.",
}

export type GiveawayMessages = typeof DEFAULT_MESSAGES

const REASON_KEYS: Record<GiveawayDenyReason, keyof GiveawayMessages> = {
    [GiveawayDenyReason.MissingRoles]: "reasonMissingRoles",
    [GiveawayDenyReason.RestrictedRole]: "reasonRestrictedRole",
    [GiveawayDenyReason.RestrictedMember]: "reasonRestrictedMember",
    [GiveawayDenyReason.AccountTooNew]: "reasonAccountTooNew",
    [GiveawayDenyReason.MemberTooNew]: "reasonMemberTooNew",
    [GiveawayDenyReason.EntriesFull]: "reasonEntriesFull",
    [GiveawayDenyReason.Ended]: "reasonEnded",
    [GiveawayDenyReason.Paused]: "reasonPaused",
}

/** Human readable text for a deny reason. */
export function denyReasonText(messages: GiveawayMessages, reason: GiveawayDenyReason) {
    return messages[REASON_KEYS[reason]] ?? reason
}
export type GiveawayMessageKey = keyof GiveawayMessages

/** Fills `{placeholders}`; unknown placeholders are left as they are. */
export function format(template: string, values: Record<string, string | number | undefined>) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        const v = values[key]
        return v === undefined ? match : String(v)
    })
}
