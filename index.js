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
 */

const client = new ForgeClient({
    extensions: [
        // better-sqlite3 is the default: typeorm's plain "sqlite" driver would
        // require the sqlite3 native package. Override via DB_TYPE in .env.
        new ForgeDB({ type: process.env.DB_TYPE || "better-sqlite3" })
    ],
    intents: [
        // Privileged: must ALSO be enabled in the Discord developer portal.
        "GuildMembers",
        "MessageContent",
        // Standard.
        "Guilds",
        "GuildModeration",
        "GuildMessages",
        "GuildInvites",
        "GuildWebhooks",
        "AutoModerationConfiguration",
        "AutoModerationExecution"
    ],
    prefixes: ["c!", "c?", "%"],
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
client.commands.load("events");          // event handlers are command files (type = event name)
client.commands.load("prefixesCmd");     // prefix commands
client.applicationCommands.load("slashesCmd"); // slash commands

client.login(process.env.BOT_TOKEN);
