"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
exports.default = new forgescript_1.NativeFunction({
    name: "$startGiveaway",
    version: "1.0.0",
    description: "Starts a new giveaway on a guild, returns giveaway id. There is no maximum duration",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "channel ID",
            description: "The channel this giveaway will be created on",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Channel,
            check: (i) => i.isTextBased() && !i.isDMBased(),
        },
        {
            name: "host ID",
            description: "The member hosting this giveaway",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Member,
            pointer: 0,
            pointerProperty: "guild"
        },
        {
            name: "prize",
            description: "The prize for this giveaway",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String
        },
        {
            name: "duration",
            description: "The duration for this giveaway, e.g. 30d or 1y",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Time
        },
        {
            name: "winners",
            description: "How many winners this giveaway will have, defaults to 1",
            rest: false,
            type: forgescript_1.ArgType.Number
        }
    ],
    output: forgescript_1.ArgType.String,
    async execute(ctx, [channel, host, prize, duration, winners]) {
        if (winners != null && !(Number.isInteger(winners) && winners >= 1))
            return this.customError("Winners must be a whole number of at least 1");
        if (!(duration > 0))
            return this.customError("Duration must be greater than 0");
        if (!prize.trim())
            return this.customError("Prize must not be empty");
        const client = ctx.client.getExtension(__1.ForgeGiveaways, true);
        const b = ctx.giveawayBuilder;
        const giveaway = await client.giveawaysManager.start({
            guildID: channel.guildId,
            channelID: channel.id,
            hostID: host.id,
            duration,
            prize,
            winnersCount: winners ?? 1,
            requirements: ctx.requirements,
            bonusEntries: b?.bonusEntries,
            maxEntries: b?.maxEntries,
            display: b?.display,
        }).catch(ctx.noop);
        return this.success(giveaway?.id);
    }
});
//# sourceMappingURL=startGiveaway.js.map