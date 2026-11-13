"use strict"
// Runs one phase of the integration test in its own process (ForgeDB keeps
// its configuration in module state, so a "restart" needs a new process).
const { boot, snow, DAY } = require("./harness")
const { Database } = require("../..")

const [, , dir, phase] = process.argv
const out = (x) => process.stdout.write(JSON.stringify(x) + "\n")

;(async () => {
    const h = await boot(dir)
    const { manager } = h

    if (phase === "start") {
        const g = await manager.start({
            prize: "A year of Nitro", duration: 400 * DAY, winnersCount: 1, hostID: snow(),
            guildID: h.guild.id, channelID: h.channel.id,
        })
        const users = Array.from({ length: 30 }, () => snow())
        for (const u of users) await manager.addEntry(g.id, u, true)
        await manager.flushAll()
        out({ id: g.id, end: g.endTimestamp(), entries: users.length })
    } else if (phase === "restart") {
        await manager._restore()
        const active = Database.activeGiveaways()
        out({
            restored: active.map((g) => ({ id: g.id, end: g.endTimestamp(), entries: g.entries.length, scheduledAt: manager.scheduler.get(g.id) })),
        })
    }
    await manager.destroy()
    process.exit(0)
})().catch((e) => { console.error(e); process.exit(1) })
