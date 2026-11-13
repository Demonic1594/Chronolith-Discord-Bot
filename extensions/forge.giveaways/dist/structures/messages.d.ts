import { GiveawayDenyReason } from "./Giveaway";
/**
 * Texts used by the default messages. Override any of them through the
 * `messages` option. Placeholders in braces are replaced at send time:
 * `{prize}`, `{mentions}`, `{count}`, `{s}` (plural suffix), `{reason}`,
 * `{guild}`, `{link}`, `{host}`, `{tickets}`.
 */
export declare const DEFAULT_MESSAGES: {
    title: string;
    pausedTitle: string;
    endedTitle: string;
    cancelledTitle: string;
    footer: string;
    pausedFooter: string;
    endedFooter: string;
    cancelledFooter: string;
    startPing: string;
    joined: string;
    left: string;
    denied: string;
    ended: string;
    paused: string;
    unknown: string;
    notReady: string;
    winners: string;
    winnersContinued: string;
    noWinners: string;
    reroll: string;
    winnerDM: string;
    reasonMissingRoles: string;
    reasonRestrictedRole: string;
    reasonRestrictedMember: string;
    reasonAccountTooNew: string;
    reasonMemberTooNew: string;
    reasonEntriesFull: string;
    reasonEnded: string;
    reasonPaused: string;
};
export type GiveawayMessages = typeof DEFAULT_MESSAGES;
/** Human readable text for a deny reason. */
export declare function denyReasonText(messages: GiveawayMessages, reason: GiveawayDenyReason): string;
export type GiveawayMessageKey = keyof GiveawayMessages;
/** Fills `{placeholders}`; unknown placeholders are left as they are. */
export declare function format(template: string, values: Record<string, string | number | undefined>): string;
//# sourceMappingURL=messages.d.ts.map