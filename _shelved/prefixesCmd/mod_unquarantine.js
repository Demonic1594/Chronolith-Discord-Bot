/*
 * Chronolith — unquarantine: Release a quarantined member
 * Prefix command (mirrors the /unquarantine slash command).
 */
module.exports = {
    name: "unquarantine",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unquarantine;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[r;$punish[unquarantine;$guildID;$authorID;$get[target];;$message[1;999]]]
$color[$actionColor[unquarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[unquarantine];$userAvatar[$get[target];64;png]]
$description[**$userTag[$get[target]]** — released from quarantine]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]
    `
};
