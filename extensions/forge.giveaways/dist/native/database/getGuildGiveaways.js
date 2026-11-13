"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveawayFilter = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const giveaway_1 = require("../../properties/giveaway");
const structures_1 = require("../../structures");
const array_1 = __importDefault(require("../../functions/array"));
var GiveawayFilter;
(function (GiveawayFilter) {
    GiveawayFilter["all"] = "all";
    GiveawayFilter["active"] = "active";
    GiveawayFilter["paused"] = "paused";
    GiveawayFilter["ended"] = "ended";
})(GiveawayFilter || (exports.GiveawayFilter = GiveawayFilter = {}));
exports.default = new forgescript_1.NativeFunction({
    name: "$getGuildGiveaways",
    version: "2.0.0",
    description: "Gets the giveaways of a guild, newest first",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "guild ID",
            description: "The guild to get giveaways of",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Guild,
        },
        {
            name: "filter",
            description: "Which giveaways to return, defaults to all",
            rest: false,
            type: forgescript_1.ArgType.Enum,
            enum: GiveawayFilter,
        },
        {
            name: "property",
            description: "The property of the giveaways to return",
            rest: false,
            type: forgescript_1.ArgType.Enum,
            enum: giveaway_1.GiveawayProperty,
        },
        {
            name: "separator",
            description: "The separator to use for each property",
            rest: false,
            type: forgescript_1.ArgType.String,
        },
    ],
    output: [
        forgescript_1.ArgType.Json,
        (0, array_1.default)()
    ],
    async execute(ctx, [guild, filter, prop, sep]) {
        const f = filter ?? GiveawayFilter.all;
        let list = await structures_1.Database.find(f === GiveawayFilter.ended ? { guildID: guild.id, hasEnded: true } : f === GiveawayFilter.all ? { guildID: guild.id } : { guildID: guild.id, hasEnded: false });
        if (f === GiveawayFilter.active)
            list = list.filter((g) => !g.isPaused());
        if (f === GiveawayFilter.paused)
            list = list.filter((g) => g.isPaused());
        list.sort((a, b) => b.timestamp - a.timestamp);
        if (prop)
            return this.success(list.map((x) => giveaway_1.GiveawayProperties[prop](x, sep)).join(sep ?? ", "));
        return this.successJSON(list);
    }
});
//# sourceMappingURL=getGuildGiveaways.js.map