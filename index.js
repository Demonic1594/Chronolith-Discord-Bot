const { ForgeClient } = require("forgescript")
const { ForgeDB } = require("@tryforge/forge.db")
   
// Client initialization
   const client = new ForgeClient({
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
    ],
    "useInviteSystem": true,
    "prefixes": [
        "%",
        "'"
    ],
    "events": [
        "autoModerationActionExecution",
        "channelCreate",
        "channelDelete",
        "channelUpdate",
        "debug",
        "emojiCreate",
        "emojiDelete",
        "emojiUpdate",
        "error",
        "guildAuditLogEntryCreate",
        "guildCreate",
        "guildDelete",
        "guildMemberAdd",
        "guildMemberRemove",
        "guildMemberUpdate",
        "guildUpdate",
        "interactionCreate",
        "inviteCreate",
        "inviteDelete",
        "messageCreate",
        "messageDelete",
        "messageReactionAdd",
        "messageReactionRemove",
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
        "userUpdate",
        "voiceStateUpdate"
    ],
    "extensions": [
        new ForgeDB()
    ]
})
   
// Load the commands
   client.commands.load("prefixesCmd")
   client.applicationCommands.load("slashesCmd")
   
// Your bot token
   client.login("MTEzNDEyMTM3NDIwNjY2MDY0OA.GL9FQd.-NAaExvsEfft1p6SqCYPyrET-LtxtvOi-uBVY0");