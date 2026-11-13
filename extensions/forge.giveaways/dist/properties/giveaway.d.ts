import { Giveaway } from "../structures";
export declare enum GiveawayProperty {
    id = "id",
    prize = "prize",
    duration = "duration",
    timestamp = "timestamp",
    endTimestamp = "endTimestamp",
    timeLeft = "timeLeft",
    winnersCount = "winnersCount",
    hasEnded = "hasEnded",
    cancelled = "cancelled",
    endedAt = "endedAt",
    isPaused = "isPaused",
    hostID = "hostID",
    guildID = "guildID",
    channelID = "channelID",
    messageID = "messageID",
    entries = "entries",
    entriesCount = "entriesCount",
    totalTickets = "totalTickets",
    maxEntries = "maxEntries",
    winners = "winners",
    previousWinners = "previousWinners",
    requiredRoles = "requiredRoles",
    requiredRolesMode = "requiredRolesMode",
    restrictedRoles = "restrictedRoles",
    restrictedMembers = "restrictedMembers",
    minAccountAge = "minAccountAge",
    minMemberAge = "minMemberAge",
    bonusEntries = "bonusEntries",
    description = "description"
}
export declare const GiveawayProperties: import("../functions/defineProperties").Properties<typeof GiveawayProperty, Giveaway>;
//# sourceMappingURL=giveaway.d.ts.map