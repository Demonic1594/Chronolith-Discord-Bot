"use strict"
const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("fs")
const os = require("os")
const path = require("path")
const { execFileSync } = require("child_process")

const DAY = 864e5
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "forge-giveaways-"))
const phase = (dir, name) => {
    const stdout = execFileSync(process.execPath, [path.join(__dirname, "fixtures/phase.js"), dir, name], { encoding: "utf8" })
    return JSON.parse(stdout.trim().split("\n").pop())
}

test("a 400 day giveaway survives a restart with its entries and end time", () => {
    const dir = tmp()
    const started = phase(dir, "start")
    assert.ok(started.end - Date.now() > 399 * DAY)

    // Raw check: the duration is stored as a full number, not truncated to 32 bits.
    const Sqlite = require("better-sqlite3")
    const row = new Sqlite(path.join(dir, "giveaways.db"), { readonly: true }).prepare("select duration, entries from giveaway").get()
    assert.equal(row.duration, 400 * DAY)
    assert.equal(row.entries.split(",").length, 30)

    const after = phase(dir, "restart")
    assert.equal(after.restored.length, 1)
    assert.equal(after.restored[0].entries, 30)
    assert.equal(after.restored[0].end, started.end)
    assert.equal(after.restored[0].scheduledAt, started.end, "end timer re-armed for the original deadline")
})

test("full life cycle against a real database", async (t) => {
    const { boot, snow } = require("./fixtures/harness")
    const { Database, GiveawayDenyReason } = require("..")
    const h = await boot(tmp())
    const { manager, sent } = h
    t.after(() => manager.destroy())
    const events = []
    for (const e of ["giveawayStart", "giveawayEnd", "giveawayReroll", "giveawayPause", "giveawayResume", "giveawayCancel", "giveawayEntryAdd", "giveawayEntryRemove", "giveawayEntryRevoke", "giveawayEdit"]) {
        h.giveaways.emitter.on(e, () => events.push(e))
    }

    const bonusRole = "400000000000000001"
    const requiredRole = "400000000000000002"
    const g = await manager.start({
        prize: "Prize @everyone", duration: 60 * DAY, winnersCount: 3, hostID: snow(),
        guildID: h.guild.id, channelID: h.channel.id,
        requirements: { requiredRoles: [requiredRole] },
        bonusEntries: [{ roleID: bonusRole, amount: 4 }],
        maxEntries: 40,
        display: { description: "Be nice", pingRoleID: "400000000000000003" },
    })
    assert.ok(g)
    assert.deepEqual(sent[0].allowedMentions, { parse: [], roles: ["400000000000000003"] }, "the prize can't ping @everyone")
    assert.equal(manager.scheduler.get(g.id), g.endTimestamp())

    // 60 members click at the same moment; 50 qualify, cap is 40.
    const qualified = Array.from({ length: 50 }, (_, i) => h.addMember(snow(), i < 5 ? [requiredRole, bonusRole] : [requiredRole]))
    const unqualified = Array.from({ length: 10 }, () => h.addMember(snow(), []))
    const results = await Promise.all([...qualified, ...unqualified].map((m) => manager.toggleEntry(g.id, m, {}, m.user)))
    const added = results.filter((r) => r.action === "added").length
    const reasons = results.filter((r) => r.action === "denied").map((r) => r.reason)
    assert.equal(added, 40)
    assert.equal(reasons.filter((r) => r === GiveawayDenyReason.EntriesFull).length, 10)
    assert.equal(reasons.filter((r) => r === GiveawayDenyReason.MissingRoles).length, 10)

    // Clicking again leaves.
    const leaver = qualified.find((m) => g.hasEntered(m.id))
    assert.equal((await manager.toggleEntry(g.id, leaver, {}, leaver.user)).action, "removed")
    assert.equal(g.entries.length, 39)

    await manager.flushAll()
    const stored = await Database.find({ id: g.id })
    assert.equal(stored[0].entries.length, 39, "coalesced writes reached the database")

    // Pause, resume, extend.
    await manager.pause(g.id)
    assert.equal(manager.scheduler.has(g.id), false)
    assert.equal((await manager.toggleEntry(g.id, leaver, {}, leaver.user)).reason, GiveawayDenyReason.Paused)
    await new Promise((r) => setTimeout(r, 30))
    await manager.resume(g.id)
    assert.ok(g.duration >= 60 * DAY + 30, "paused time is added back")
    const before = g.endTimestamp()
    await manager.extend(g.id, DAY)
    assert.equal(g.endTimestamp(), before + DAY)
    assert.equal(manager.scheduler.get(g.id), g.endTimestamp())

    // One winner loses the role before the end: they must not win.
    const dropped = qualified.find((m) => g.hasEntered(m.id))
    dropped.roles = []

    const ended = await manager.end(g.id)
    assert.equal(ended.winners.length, 3)
    assert.equal(new Set(ended.winners).size, 3)
    assert.ok(!ended.winners.includes(dropped.id))
    assert.ok(ended.winners.every((id) => g.entries.includes(id)))
    assert.equal(await manager.end(g.id), null, "ending twice is a no-op")
    const announce = sent.find((m) => m.replyTo === g.messageID)
    assert.deepEqual([...announce.allowedMentions.users].sort(), [...ended.winners].sort())

    const first = [...ended.winners]
    const rerolled = await manager.reroll(g.id, true, 2)
    assert.equal(rerolled.winners.length, 2)
    assert.ok(rerolled.winners.every((id) => !first.includes(id)), "unique reroll excludes previous winners")
    assert.deepEqual(rerolled.previousWinners.sort(), first.sort())

    // Cancel and automatic end.
    const c = await manager.start({ prize: "c", duration: DAY, winnersCount: 1, hostID: snow(), guildID: h.guild.id, channelID: h.channel.id })
    const cancelled = await manager.cancel(c.id)
    assert.ok(cancelled.cancelled && cancelled.hasEnded && !cancelled.winners.length)
    assert.equal(await manager.reroll(c.id), null, "cancelled giveaways can't be rerolled")

    const quick = await manager.start({ prize: "q", duration: 150, winnersCount: 1, hostID: snow(), guildID: h.guild.id, channelID: h.channel.id })
    const solo = h.addMember(snow())
    await manager.toggleEntry(quick.id, solo, {}, solo.user)
    await new Promise((r) => setTimeout(r, 400))
    const q = await Database.get(quick.id)
    assert.ok(q.hasEnded)
    assert.deepEqual(q.winners, [solo.id])

    for (const e of ["giveawayStart", "giveawayEnd", "giveawayReroll", "giveawayPause", "giveawayResume", "giveawayCancel", "giveawayEntryAdd", "giveawayEntryRemove", "giveawayEntryRevoke", "giveawayEdit"]) {
        assert.ok(events.includes(e), `${e} was emitted`)
    }

    const p = manager.start({ prize: "x", duration: 0, winnersCount: 1, hostID: "1", guildID: "1", channelID: "1" })
    await assert.rejects(p, RangeError)
})

test("README examples and every new function compile", async () => {
    const { Compiler } = require("@tryforge/forgescript")
    // The extension was booted by the previous test in this process, so all
    // of its functions are registered with the compiler.
    const snippets = [
        `$addRequiredRoles[123456789012345678]
         $setRequiredRolesMode[any]
         $addRestrictedRoles[<@&123456789012345679>]
         $setMinimumAccountAge[30d]
         $setMinimumMemberAge[7d]
         $addBonusEntries[234567890123456789;2]
         $setMaxEntries[500]
         $setGiveawayDescription[Thanks!]
         $setGiveawayColor[#5865F2]
         $setGiveawayImage[https://example.com/a.png]
         $setGiveawayThumbnail[https://example.com/b.png]
         $setGiveawayPingRole[123456789012345678]
         $let[id;$startGiveaway[$channelID;$authorID;Discord Nitro;60d;3]]`,
        `$endGiveaway[1] $cancelGiveaway[1] $pauseGiveaway[1] $resumeGiveaway[1]
         $extendGiveaway[1;1d] $shortenGiveaway[1;1h] $rerollGiveaway[1;true;2]
         $editGiveaway[1;$guildID;$authorID;New prize;2]
         $addGiveawayEntry[1;$authorID;true] $removeGiveawayEntry[1;$authorID]
         $deleteGiveaway[1] $wipeGiveaways[$guildID]`,
        `$getGuildGiveaways[$guildID;active;prize;, ] $getGiveaway[1;timeLeft] $getAllGiveaways
         $giveawayEndTimestamp $giveawayTimeLeft $giveawayIsPaused $giveawayIsCancelled
         $giveawayEndedAt $giveawayEntriesCount $giveawayTotalTickets $giveawayMaxEntries
         $giveawayDescription $giveawayMinAccountAge $giveawayMinMemberAge $giveawayRequiredRolesMode
         $giveawayBonusEntries $giveawayHasEntered[1;$authorID] $giveawayEntryWeight[1;$authorID]
         $giveawayDenyReason $newGiveaway[entriesCount] $oldGiveaway`,
        `$interactionReply[$ephemeral You can't join: $giveawayDenyReason]`,
    ]
    const { FunctionManager } = require("@tryforge/forgescript")
    for (const code of snippets) {
        assert.doesNotThrow(() => Compiler.compile(code), code.slice(0, 60))
        // Unknown $names compile as plain text, so also check each one exists.
        for (const name of code.match(/\$[a-zA-Z]+/g)) assert.ok(FunctionManager.get(name.slice(1)) || FunctionManager.get(name), `${name} is registered`)
    }
})

test("a deadline hit while disconnected is retried, not ended without winners", async () => {
    const { Scheduler } = require("..")
    const { mock } = require("node:test")
    const manager = Object.create(require("..").GiveawaysManager.prototype)
    let ended = 0
    Object.assign(manager, { client: { isReady: () => false }, end: async () => { ended++ } })
    manager.scheduler = new Scheduler(() => {})
    mock.timers.enable({ apis: ["setTimeout", "Date"], now: 1_000 })
    try {
        await manager._onDeadline("x")
        assert.equal(ended, 0)
        assert.equal(manager.scheduler.get("x"), 61_000)
        manager.client.isReady = () => true
        await manager._onDeadline("x")
        assert.equal(ended, 1)
    } finally {
        manager.scheduler.clear()
        mock.timers.reset()
    }
})
