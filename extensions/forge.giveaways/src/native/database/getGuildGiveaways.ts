import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { GiveawayProperties, GiveawayProperty } from "../../properties/giveaway"
import { Database } from "../../structures"
import array from "../../functions/array"

export enum GiveawayFilter {
    all = "all",
    active = "active",
    paused = "paused",
    ended = "ended",
}

export default new NativeFunction({
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
            type: ArgType.Guild,
        },
        {
            name: "filter",
            description: "Which giveaways to return, defaults to all",
            rest: false,
            type: ArgType.Enum,
            enum: GiveawayFilter,
        },
        {
            name: "property",
            description: "The property of the giveaways to return",
            rest: false,
            type: ArgType.Enum,
            enum: GiveawayProperty,
        },
        {
            name: "separator",
            description: "The separator to use for each property",
            rest: false,
            type: ArgType.String,
        },
    ],
    output: [
        ArgType.Json,
        array<ArgType.Unknown>()
    ],
    async execute(ctx, [guild, filter, prop, sep]) {
        const f = filter ?? GiveawayFilter.all
        let list = await Database.find(f === GiveawayFilter.ended ? { guildID: guild.id, hasEnded: true } : f === GiveawayFilter.all ? { guildID: guild.id } : { guildID: guild.id, hasEnded: false })
        if (f === GiveawayFilter.active) list = list.filter((g) => !g.isPaused())
        if (f === GiveawayFilter.paused) list = list.filter((g) => g.isPaused())
        list.sort((a, b) => b.timestamp - a.timestamp)

        if (prop) return this.success(list.map((x) => GiveawayProperties[prop](x, sep)).join(sep ?? ", "))
        return this.successJSON(list)
    }
})
