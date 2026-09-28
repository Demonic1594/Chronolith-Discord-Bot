/*
 * Chronolith — unban: Unban one or more users by ID
 * Prefix command (mirrors the /unban slash command).
 */
module.exports = {
    name: "unban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unban;3s;]
$onlyIf[$message[0]!=;Provide one or more user IDs.]
$let[ok;0]
$arrayLoad[ids; ;$message]
$arrayForEach[ids;u;
$if[$env[u]!=;
$let[r;$punish[unban;$guildID;$authorID;$env[u];;Unban]]
$if[$checkContains[$get[r];⛔]!=true;
$letSum[ok;1]
]
]
]
$description[🕊 Unbanned \`$get[ok]\` user(s).]
$color[$actionColor[unban]]
$footer[Chronolith • Moderation]
    `
};
