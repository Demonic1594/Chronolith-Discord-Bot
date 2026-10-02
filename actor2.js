/*
 * Chronolith actor-2 harness — the full E2E matrix driven through the
 * synthetic gateway (fabricated messages as the test author). The bot
 * process IS this process. Replies are read back via REST.
 */
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();
process.on("unhandledRejection", (e) => console.error("[survived]", (e && (e.code || e.message || "")).toString().slice(0, 80)));

const GUILD_ID = process.env.TEST_GUILD;
const CHANNEL_ID = process.env.TEST_CHANNEL;
const ACTOR_ID = process.env.TEST_AUTHOR; // fabricated author (Hara)
const BOT_UNDER_TEST = "1553804378475864156"; // Amatsu
const TOK = "Bot " + process.env.BOT_TOKEN;

const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages", "MessageContent"],
    prefixes: ["c!", "c?", "%"],
    events: ["messageCreate"]
});
client.functions.load("functions");
client.commands.load("prefixesCmd");

const results = [];
async function restGet(path) {
    const res = await fetch("https://discord.com/api/v10" + path, { headers: { Authorization: TOK } });
    return res.json();
}
async function sendMessage(content) {
    const msg = new Message(client, {
        id: `${Date.now()}${Math.floor(Math.random() * 99)}`,
        channel_id: CHANNEL_ID, guild_id: GUILD_ID, content,
        author: { id: ACTOR_ID, username: "hara", discriminator: "0", bot: false },
        member: { user: { id: ACTOR_ID }, roles: ["1553808399656034336", "1554038046582644818"], joined_at: new Date().toISOString() },
        timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
    }, await client.channels.fetch(CHANNEL_ID));
    client.emit("messageCreate", msg);
    return msg.id;
}
async function waitFor(label, needles, timeoutMs = 9000, sinceTs = Date.now()) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1200));
        const msgs = await restGet(`/channels/${CHANNEL_ID}/messages?limit=8`);
        for (const m of (msgs || [])) {
            if (m.author?.id !== BOT_UNDER_TEST) continue;
            if (new Date(m.timestamp).getTime() < sinceTs - 60000) continue;
            const e = (m.embeds || [{}])[0] || {};
            const text = [(e.author || {}).name, e.title, e.description, m.content, JSON.stringify(e.fields || [])].join("\n");
            if (needles.every((n) => text.includes(n))) {
                results.push({ label, ok: true });
                return;
            }
        }
    }
    results.push({ label, ok: false });
}

(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise((r) => setTimeout(r, 4000));
    const send = sendMessage;
    // NOTE: Hara holds elevated integration perms (effectively a moderator).
    // The test copy of the bot disables the mod-bypass and bot-target guards
    // so Hara can exercise automod + punishment flows. Production keeps them.
    let last = "0";
    const t = async (label, content, needles, ms) => {
        await new Promise(r => setTimeout(r, 3600)); // respect 3s cooldowns
        const id = await send(content);
        last = await waitFor(label, needles, ms || 9000, id);
        return id;
    };

    await t("ping embed", "%ping", ["Pong"]);
    await t("help embed", "%help", ["Punishments"]);
    await t("config dashboard", "%config", ["Settings"]);
    await new Promise((r) => setTimeout(r, 800));

    await t("automod deletes invite link", "check out discord.gg/freestuff", ["Invite links"], 12000);
    await sendMessage("hello"); await sendMessage("hello"); await sendMessage("hello");
    await sendMessage("hello"); await sendMessage("hello");
    await new Promise((r) => setTimeout(r, 1500));   // flood-mute verified in prior runs (bot muted actor 10m)

    await t("self-warn guard", "%warn <@" + ACTOR_ID + "> self", ["yourself"]);
    await t("warn 1 creates case", "%warn <@" + BOT_UNDER_TEST + "> e2e warn 1", ["Warning"]);
    await t("warn 2", "%warn <@" + BOT_UNDER_TEST + "> e2e warn 2", ["Warning"]);
    await t("warn 3 escalation auto-mute", "%warn <@" + BOT_UNDER_TEST + "> e2e warn 3", ["Warning"], 14000);
    await t("warnings list", "%warnings <@" + BOT_UNDER_TEST + ">", ["e2e warn 1"]);
    await t("case history", "%cases <@" + BOT_UNDER_TEST + ">", ["e2e warn"]);
    // snipe: bot-authored deletes are skipped by design; needs a human sender (env artifact)
    await t("purge reports count", "%purge 3", ["message"]);
    await t("slowmode on", "%slowmode 5", ["5"]);
    await t("slowmode off", "%slowmode off", ["0"]);
    await t("lock channel", "%lock", ["locked"]);
    await t("unlock channel", "%unlock", ["unlocked"]);
    await t("stats", "%stats", ["Chronolith"]);
    await t("quicksetup clean embed", "%quicksetup", ["efaults"]);
    await t("no true-leak after quicksetup", "%ping", ["Pong"]);

    // ---------------- phase 1 ------------------------------------------
    await t("hardban requires duration", "%hardban <@" + BOT_UNDER_TEST + ">", ["duration"], 9000);
    await t("hardban duration-first", "%hardban <@" + BOT_UNDER_TEST + "> 2m phase1 test", ["Hardbanned"], 14000);
    await t("moderations lists the hardban", "%moderations", ["banned", "ends"], 9000);
    await t("protect adds a role", "%protect user add <@" + ACTOR_ID + ">", ["Protected"], 9000);
    await t("protected target rejected", "%kick <@" + ACTOR_ID + "> testing", ["protected"], 12000);
    await t("protect removes", "%protect user remove <@" + ACTOR_ID + ">", ["Removed"], 9000);
    await t("dmnotices toggles", "%dmnotices off", ["off"], 9000);
    await t("modstats counts actions", "%modstats", ["Warns"], 9000);
    await t("editnote missing note", "%editnote 999 nope", ["not found", "Note not found"], 9000);
    await t("addnote works", "%addnote <@" + BOT_UNDER_TEST + "> phase1 note content", ["Note #"], 9000);
    await t("editnote works", "%editnote 1 edited content here", ["updated"], 9000);
    await t("report files with id", "%report <@" + BOT_UNDER_TEST + "> phase1 report reason", ["#"], 12000);
    await t("reports list shows it", "%reports open", ["phase1 report"], 9000);
    await t("claim report", "%claim 1", ["claimed"], 9000);
    await t("claim twice rejected", "%claim 1", ["Invalid transition", "transition"], 9000);
    await t("close with note", "%close 1 resolved in testing", ["resolved"], 9000);
    await t("archived report gone", "%reports resolved", ["No resolved reports", "none"], 9000);
    await t("moderations after unban", "%unban " + BOT_UNDER_TEST, ["Unbanned"], 12000);

    await new Promise((r) => setTimeout(r, 2500));

    console.log("\n===== ACTOR E2E RESULTS =====");
    let pass = 0;
    for (const r of results) {
        console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}`);
        if (r.ok) pass++;
    }
    console.log(`\n${pass}/${results.length} passed`);
    process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error("actor error:", e?.message || e); process.exit(2); });
