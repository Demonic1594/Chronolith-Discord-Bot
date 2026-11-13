"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const structures_1 = require("../../structures");
exports.default = new forgescript_1.NativeFunction({
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
            type: forgescript_1.ArgType.Guild,
        },
    ],
    output: forgescript_1.ArgType.Number,
    async execute(ctx, [guild]) {
        const manager = ctx.client.getExtension(__1.ForgeGiveaways, true).giveawaysManager;
        if (guild) {
            const ids = (await structures_1.Database.find({ guildID: guild.id })).map((g) => g.id);
            let n = 0;
            for (const id of ids)
                n += (await manager.discard(id)).affected ?? 0;
            return this.success(n);
        }
        const all = await structures_1.Database.getAll();
        for (const g of all)
            manager.scheduler.cancel(g.id);
        await structures_1.Database.wipe();
        return this.success(all.length);
    }
});
//# sourceMappingURL=wipeGiveaways.js.map