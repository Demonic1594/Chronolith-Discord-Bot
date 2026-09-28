/*
 * Chronolith — warn: Warn a user (auto-escalates at threshold)
 * Prefix command (mirrors the /warn slash command).
 */
module.exports = {
    name: "warn",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-warn;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user. Check the ID/mention/name.]
$let[r;$punish[warn;$guildID;$authorID;$get[target];;$message[1;999]]]
$color[$actionColor[warn]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[warn];$userAvatar[$get[target];64;png]]
$description[**$userTag[$get[target]]**
> $if[$message[1;999]==;No reason provided;$message[1;999]]]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Moderation]
    `
};
