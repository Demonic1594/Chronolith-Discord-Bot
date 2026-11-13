"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveawayProperties = exports.GiveawayProperty = void 0;
const defineProperties_1 = __importDefault(require("../functions/defineProperties"));
var GiveawayProperty;
(function (GiveawayProperty) {
    GiveawayProperty["id"] = "id";
    GiveawayProperty["prize"] = "prize";
    GiveawayProperty["duration"] = "duration";
    GiveawayProperty["timestamp"] = "timestamp";
    GiveawayProperty["endTimestamp"] = "endTimestamp";
    GiveawayProperty["timeLeft"] = "timeLeft";
    GiveawayProperty["winnersCount"] = "winnersCount";
    GiveawayProperty["hasEnded"] = "hasEnded";
    GiveawayProperty["cancelled"] = "cancelled";
    GiveawayProperty["endedAt"] = "endedAt";
    GiveawayProperty["isPaused"] = "isPaused";
    GiveawayProperty["hostID"] = "hostID";
    GiveawayProperty["guildID"] = "guildID";
    GiveawayProperty["channelID"] = "channelID";
    GiveawayProperty["messageID"] = "messageID";
    GiveawayProperty["entries"] = "entries";
    GiveawayProperty["entriesCount"] = "entriesCount";
    GiveawayProperty["totalTickets"] = "totalTickets";
    GiveawayProperty["maxEntries"] = "maxEntries";
    GiveawayProperty["winners"] = "winners";
    GiveawayProperty["previousWinners"] = "previousWinners";
    GiveawayProperty["requiredRoles"] = "requiredRoles";
    GiveawayProperty["requiredRolesMode"] = "requiredRolesMode";
    GiveawayProperty["restrictedRoles"] = "restrictedRoles";
    GiveawayProperty["restrictedMembers"] = "restrictedMembers";
    GiveawayProperty["minAccountAge"] = "minAccountAge";
    GiveawayProperty["minMemberAge"] = "minMemberAge";
    GiveawayProperty["bonusEntries"] = "bonusEntries";
    GiveawayProperty["description"] = "description";
})(GiveawayProperty || (exports.GiveawayProperty = GiveawayProperty = {}));
const join = (arr, sep) => arr?.join(sep ?? ", ");
exports.GiveawayProperties = (0, defineProperties_1.default)({
    id: (i) => i?.id,
    prize: (i) => i?.prize,
    duration: (i) => i?.duration,
    timestamp: (i) => i?.timestamp,
    endTimestamp: (i) => i?.endTimestamp(),
    timeLeft: (i) => i?.timeLeft(),
    winnersCount: (i) => i?.winnersCount,
    hasEnded: (i) => i?.hasEnded,
    cancelled: (i) => (i ? !!i.cancelled : undefined),
    endedAt: (i) => i?.endedAt,
    isPaused: (i) => i?.isPaused(),
    hostID: (i) => i?.hostID,
    guildID: (i) => i?.guildID,
    channelID: (i) => i?.channelID,
    messageID: (i) => i?.messageID,
    entries: (i, sep) => join(i?.entries, sep),
    entriesCount: (i) => i?.entries.length,
    totalTickets: (i) => i?.totalTickets(),
    maxEntries: (i) => i?.maxEntries,
    winners: (i, sep) => join(i?.winners, sep),
    previousWinners: (i, sep) => join(i?.previousWinners, sep),
    requiredRoles: (i, sep) => join(i?.requirements?.requiredRoles, sep),
    requiredRolesMode: (i) => (i ? i.requirements?.requiredRolesMode ?? "all" : undefined),
    restrictedRoles: (i, sep) => join(i?.requirements?.restrictedRoles, sep),
    restrictedMembers: (i, sep) => join(i?.requirements?.restrictedMembers, sep),
    minAccountAge: (i) => i?.requirements?.minAccountAge,
    minMemberAge: (i) => i?.requirements?.minMemberAge,
    bonusEntries: (i, sep) => i?.bonusEntries?.map((b) => `${b.roleID}:${b.amount}`).join(sep ?? ", "),
    description: (i) => i?.display?.description,
});
//# sourceMappingURL=giveaway.js.map