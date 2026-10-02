const fs = require("fs");
const LOCK = __dirname + "/bot.lock";
(function guard() {
    let prev = null;
    try { prev = parseInt(fs.readFileSync(LOCK, "utf8").trim(), 10); } catch {}
    if (prev && !isNaN(prev)) {
        let alive = false;
        try { process.kill(prev, 0); alive = true; } catch (e) { alive = e.code === "EPERM"; }
        if (alive) {
            console.error("========================================");
            console.error(`[lock] REFUSING TO START — another Chronolith is already running as PID ${prev}.`);
            console.error(`[lock] Multiple sessions on one token multi-handle every command/interaction.`);
            console.error(`[lock] Kill it first:  pkill -f index.js   then restart.`);
            console.error("========================================");
            process.exit(1);
        }
    }
    fs.writeFileSync(LOCK, String(process.pid));
})();
process.on("exit", () => { try { fs.unlinkSync(LOCK); } catch {} });

const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
require("dotenv").config();

// Survival hardening: transient storage/driver errors (SQLITE_IOERR and
// friends on this host) surface as unhandled rejections deep inside typeorm.
// Log them; never let one take the bot down.
process.on("unhandledRejection", (err) => {
    console.error("[survived] unhandledRejection:", err && err.code ? err.code : err);
});
process.on("uncaughtException", (err) => {
    console.error("[survived] uncaughtException:", err && err.code ? err.code : err);
});

/*
 * Chronolith — moderation bot for Discord, built on ForgeScript.
 *
 * Structure:
 *   functions/    shared engines (permission gates, punishment pipeline,
 *                 case system, snipe cache) — "thin commands, fat functions"
 *   events/       event handlers (automod, snipe capture, join gate, logs,
 *                 component router) — these are command files whose `type`
 *                 is the event they bind to, loaded through commands.load()
 *   prefixesCmd/  prefix commands (mirrors of the slash set)
 *   slashesCmd/   slash commands (mirrors of the prefix set)
 *
 * All persistent state lives in ForgeDB guild variables, namespaced per
 * guild — the bot is fully multi-guild safe.
 *
 * NOTE (loader semantics, source-verified): commands.load() has NO
 * de-duplication — loading any folder twice registers every command in it
 * twice, and both copies execute per message. Load each folder exactly once.
 */

const client = new ForgeClient({
    extensions: [
        new ForgeDB({ type: process.env.DB_TYPE || "better-sqlite3" })
    ],
    intents: [
        "GuildMembers",
        "MessageContent",
        "Guilds",
        "GuildModeration",
        "GuildMessages",
        "GuildInvites",
        "GuildWebhooks",
        "AutoModerationConfiguration",
        "AutoModerationExecution"
    ],
    prefixes: ["c!", "c?", "%"],
    allowBots: process.env.TEST_ALLOWBOTS === "1",
    events: [
        "clientReady",
        "messageCreate",
        "messageDelete",
        "messageUpdate",
        "interactionCreate",
        "guildMemberAdd",
        "guildMemberRemove",
        "guildMemberUpdate",
        "guildBanAdd",
        "guildBanRemove",
        "guildAuditLogEntryCreate",
        "channelCreate",
        "channelDelete",
        "channelUpdate",
        "roleCreate",
        "roleDelete",
        "roleUpdate"
    ]
});

client.functions.load("functions");
client.commands.load("events");
client.commands.load("prefixesCmd");
client.applicationCommands.load("slashesCmd");

// Live interaction diagnostics: how late is our first response?
const { ButtonInteraction } = require("discord.js");
for (const m of ["update", "reply", "deferUpdate", "editReply"]) {
    const orig = ButtonInteraction.prototype[m];
    if (!orig) continue;
    ButtonInteraction.prototype[m] = function (...a) {
        console.log(`[ix-timing] ${m} for ${this.customId} at +${Date.now() - this.createdTimestamp}ms embeds=${(a[0]?.embeds || []).length}`);
        return orig.apply(this, a);
    };
}
client.on("interactionCreate", (i) => {
    if (i.isButton?.()) console.log(`[ix-timing] RECEIVED ${i.customId} at +${Date.now() - i.createdTimestamp}ms`);
});

client.login(process.env.BOT_TOKEN);
require("./dbsplit").init().catch((e) => console.error("[dbsplit] routing unavailable, running on single forge.db:", e?.message || e));
