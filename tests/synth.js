/*
 * Chronolith synthetic-gateway test harness.
 *
 * This process IS the bot (full command/event/function load, real login).
 * It then fabricates discord.js Messages for a REAL channel and emits
 * messageCreate — driving the exact production paths — and captures the
 * bot's own replies from the gateway to assert on them.
 *
 * Safe by construction: read-only commands, rejection paths and gates only.
 *   node tests/synth.js
 */
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();

const GUILD_ID = process.env.TEST_GUILD;
const CHANNEL_ID = process.env.TEST_CHANNEL;
const OWNER_ID = process.env.TEST_AUTHOR; // must be a REAL guild member (guild owner)

process.on("unhandledRejection", (e) => console.error("[harness] survived:", e?.code || e?.message?.slice(0, 80)));

const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages", "MessageContent",
              "GuildInvites", "GuildWebhooks", "AutoModerationConfiguration", "AutoModerationExecution"],
    prefixes: ["c!", "c?", "%"],
    events: ["clientReady", "messageCreate", "messageDelete", "messageUpdate", "interactionCreate",
             "guildMemberAdd", "guildMemberRemove", "guildMemberUpdate", "guildBanAdd", "guildBanRemove",
             "guildAuditLogEntryCreate", "channelCreate", "channelDelete", "channelUpdate",
             "roleCreate", "roleDelete", "roleUpdate"]
});

// loaders join paths with process.cwd() — pass RELATIVE paths and run from the repo root
client.functions.load("functions");
client.commands.load("events");
client.commands.load("prefixesCmd");
client.applicationCommands.load("slashesCmd");

const results = [];
const waiters = [];

function expectReply(label, needles, timeoutMs = 8000) {
    return new Promise((resolve) => {
        const w = { label, needles, resolve, timer: setTimeout(() => {
            results.push({ label, ok: false, got: "(timeout)" });
            waiters.splice(waiters.indexOf(w), 1);
            resolve();
        }, timeoutMs) };
        waiters.push(w);
    });
}

client.on("messageCreate", (msg) => {
    if (msg.author.id !== client.user.id) return;
    const text = [msg.embeds[0]?.data?.author?.name, msg.embeds[0]?.data?.title,
                  msg.embeds[0]?.data?.description, msg.content,
                  JSON.stringify(msg.embeds[0]?.data?.fields || [])].join("\n");
    for (const w of [...waiters]) {
        if (w.needles.every((n) => text.includes(n))) {
            clearTimeout(w.timer);
            results.push({ label: w.label, ok: true, got: text.slice(0, 160) });
            waiters.splice(waiters.indexOf(w), 1);
            w.resolve();
        }
    }
});

async function send(content) {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const msg = new Message(client, {
        id: `${Date.now()}${Math.floor(Math.random() * 999)}`,
        channel_id: CHANNEL_ID, guild_id: GUILD_ID, content,
        author: { id: OWNER_ID, username: "owner", discriminator: "0", bot: false },
        member: { user: { id: OWNER_ID }, roles: [], joined_at: new Date().toISOString() },
        timestamp: new Date().toISOString(),
        tts: false, mention_everyone: false, pinned: false, type: 0
    }, channel);
    client.emit("messageCreate", msg);
}

(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise((r) => setTimeout(r, 4000));

    const tests = [
        ["ping replies", "%ping", ["Gateway"]],
        ["help page 1", "%help", ["Punishments"]],
        ["config dashboard passes mod gate", "%config", ["Settings"]],
        ["warn rejects unknown user", "%warn 999999999999999999 testing", ["Could not resolve that user"]],
        ["case 99999 not found", "%case 99999", ["ase not found", "Case not found"]],
        ["snipe empty", "%snipe", ["othing to snipe", "Nothing to snipe"]],
        ["slowmode usage hint", "%slowmode", ["sage", "slowmode"]],
        ["stats", "%stats", ["Runtime"]],
        ["words list empty-ok", "%words", ["No banned words"]],
        ["automod bad module rejected", "%automod nonsense on", ["sage", "automod"]],
        ["delwarn missing case", "%delwarn 999999999999999999 5", ["Could not resolve that user"]],
        ["unban usage gate", "%unban", ["Provide one or more"]],
        ["reason missing arg", "%reason", ["sage", "reason"]],
        ["massban no args", "%massban", ["sage", "massban"]],
        ["ban rejects no target", "%ban", ["No valid target"]],
        ["lockdown runs (count report)", "%lockdown", ["Locked"]],
        ["lockdown cleanup (unlock)", "%unlock", ["nlocked"]],
    ];

    for (const [label, content, needles] of tests) {
        const p = expectReply(label, needles);
        await send(content);
        await p;
    }

    // undo the lockdown the last test caused
    await send("%unlockdown");
    await new Promise((r) => setTimeout(r, 2500));

    console.log("\n===== SYNTHETIC GATEWAY TEST RESULTS =====");
    let pass = 0;
    for (const r of results) {
        console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.ok ? "" : " — got: " + r.got}`);
        if (r.ok) pass++;
    }
    console.log(`\n${pass}/${results.length} passed`);
    process.exit(results.length === pass ? 0 : 1);
})().catch((e) => { console.error("harness error:", e?.message || e); process.exit(2); });
