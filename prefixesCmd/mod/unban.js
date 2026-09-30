/*
 * Chronolith — unban: Remove one or more bans by user ID (with reason).
 * Prefix command (mirrors the /unban slash command).
 * Reply carries a one-click re-Ban button (single-target) — the toggle
 * counterpart of the Unban button on %ban replies.
 */
module.exports = {
    name: "unban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unban;3s;]
$onlyIf[$message[0]!=;Provide one or more user IDs (extra words become the reason).]
$let[ulist;]
$let[reason;]
$!arrayLoad[toks; ;$message]
$!arrayForEach[toks;t;
$if[$isNumber[$env[t]]==true;
$let[ulist;$get[ulist]$if[$get[ulist]!=;,]$env[t]]
;
$let[reason;$get[reason]$if[$get[reason]!=; ]$env[t]]
]
]
$onlyIf[$get[ulist]!=;Provide one or more user IDs (extra words become the reason).]
$let[reason;$if[$get[reason]==;Unban;$get[reason]]]
$let[ok;0]
$!arrayLoad[ids;,;$get[ulist]]
$!arrayForEach[ids;u;
$if[$env[u]!=;
$let[r;$punish[unban;$guildID;$authorID;$env[u];;$get[reason]]]
$if[$checkContains[$get[r];⛔]!=true;
$letSum[ok;1]
]
]
]
$author[$actionEmoji[unban];$userAvatar[$botID;32;png]]
$color[$actionColor[unban]]
$description[<@$get[ulist]>
> $get[reason]]
$addField[Unbanned;$get[ok];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$get[ulist];,]!=true;
$addActionRow
$addButton[bban-$get[ulist]-$authorID;Ban;Danger]
]
    `
};
