/*
 * Chronolith — cleanup: Purge the bot's own messages (pinned included)
 * Prefix command (mirrors the /cleanup slash command).
 */
module.exports = {
    name: "cleanup",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-cleanup;3s;]
$onlyIf[$hasPerms[$guildID;$botID;ManageMessages]==true;⛔ I am missing the Manage Messages permission.]
$let[scan;$scanMessages[$channelID;$if[$checkCondition[$if[$message[0]!=;$message[0];100] + 0 > 500]==true;500;$if[$message[0]!=;$message[0];100]]]]
$onlyIf[$checkContains[$get[scan];\\[;1]==true;Scan failed — cannot read this channel's history.]
$!jsonLoad[found;$get[scan]]
$let[ids;]
$let[count;0]
$!arrayForEach[found;m;
$if[$and[$env[m;a]==$botID;$math[$arrayLength[$arrayLoad[cur;,;$get[ids]]]]<100]==true;
$let[ids;$get[ids]$if[$get[ids]!=;,]$env[m;i]]
$letSum[count;1]
]
]
$if[$get[count]>0;
$let[del;$deleteMessage[$channelID;$get[ids]]]
🧹 Cleaned \`$get[del]\` of my messages (pinned included).;
🧹 Nothing to clean.
]
$footer[Chronolith • Cleanup]
$color[5865F2]
    `
};
