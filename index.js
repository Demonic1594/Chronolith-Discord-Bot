const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { ForgeAPI } = require("@tryforge/forge.api");
const { ForgeCanvas } = require("@tryforge/forge.canvas");
const { ForgeMusic } = require("forge-music");
require('dotenv').config();

// Client initialization
const client = new ForgeClient({
    "extensions": [
        new ForgeDB(),
        new ForgeAPI({
            port: 1594,
            authorization: [
                "test1",
                "test2"
            ]
        }),
        new ForgeCanvas(),
        new ForgeMusic({
            soundsFolder: `${process.cwd()}/sounds`
        })
    ],     // Extensions for the bot, such as ForgeDB for the DataBase, ForgeMusic for the Music functions for this bot.
    "intents": [
        "Guilds",
        "GuildMembers",
        "GuildModeration",
        "GuildEmojisAndStickers",
        "GuildIntegrations",
        "GuildWebhooks",
        "GuildInvites",
        "GuildVoiceStates",
        "GuildPresences",
        "GuildMessages",
        "GuildMessageReactions",
        "GuildMessageTyping",
        "DirectMessages",
        "DirectMessageReactions",
        "DirectMessageTyping",
        "MessageContent",
        "GuildScheduledEvents",
        "AutoModerationConfiguration",
        "AutoModerationExecution"
    ],     // Privileged Intents, needs these intents enabled in https://discord.com/developers/applications. Regardless enable them to fit your needs or remove them otherwise. (doesnt really impact it that much if you keep them)
    "useInviteSystem": true,
    "prefixes": [
        "%",
        "'",
        "`",
        "c!",
        "c?"
    ],     // These are all prefixes that you can use on bot.
    "events": [
        "autoModerationActionExecution",
        "channelCreate",
        "channelDelete",
        "channelPinsUpdate",
        "channelUpdate",
        "debug",
        "emojiCreate",
        "emojiDelete",
        "emojiUpdate",
        "error",
        "guildAuditLogEntryCreate",
        "guildAvailable",
        "guildBanAdd",
        "guildBanRemove",
        "guildCreate",
        "guildDelete",
        "guildMemberAdd",
        "guildMemberAvailable",
        "guildMemberRemove",
        "guildMemberUpdate",
        "guildScheduledEventCreate",
        "guildScheduledEventDelete",
        "guildScheduledEventUpdate",
        "guildScheduledEventUserAdd",
        "guildScheduledEventUserRemove",
        "guildUnavailable",
        "guildUpdate",
        "interactionCreate",
        "inviteCreate",
        "inviteDelete",
        "messageCreate",
        "messageDelete",
        "messageDeleteBulk",
        "messageReactionAdd",
        "messageReactionRemove",
        "messageReactionRemoveAll",
        "messageReactionRemoveEmoji",
        "messageUpdate",
        "presenceUpdate",
        "ready",
        "roleCreate",
        "roleDelete",
        "roleUpdate",
        "shardDisconnect",
        "shardError",
        "shardReady",
        "shardReconnecting",
        "shardResume",
        "stageInstanceCreate",
        "stageInstanceDelete",
        "stageInstanceUpdate",
        "stickerCreate",
        "stickerDelete",
        "stickerUpdate",
        "threadCreate",
        "threadDelete",
        "threadMemberUpdate",
        "threadUpdate",
        "typingStart",
        "userUpdate",
        "voiceStateUpdate"
    ]     // All events that the bot will act on.
});

// Loads up all the commands.
client.commands.load("prefixesCmd");
client.applicationCommands.load("slashesCmd");

const token = process.env.BOT_TOKEN;
client.login(token);