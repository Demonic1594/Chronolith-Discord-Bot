import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { ForgeGiveaways } from "../.."
import { Database } from "../../structures"

export default new NativeFunction({
    name: "$wipeGiveaways",
    version: "1.0.0",
    description: "Deletes giveaways permanently: those of one guild if given, otherwise all of them. Use with caution, returns the number deleted",
    unwrap: true,
    brackets: false,
    args: [
        {
            name: "guild ID",
            description: "Only wipe giveaways of this guild",
            rest: false,
            type: ArgType.Guild,
        },
    ],
    output: ArgType.Number,
    async execute(ctx, [guild]) {
        const manager = ctx.client.getExtension(ForgeGiveaways, true).giveawaysManager
        if (guild) {
            const ids = (await Database.find({ guildID: guild.id })).map((g) => g.id)
            let n = 0
            for (const id of ids) n += (await manager.discard(id)).affected ?? 0
            return this.success(n)
        }
        const all = await Database.getAll()
        for (const g of all) manager.scheduler.cancel(g.id)
        await Database.wipe()
        return this.success(all.length)
    }
})
