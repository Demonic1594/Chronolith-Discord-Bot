/*
 * Chronolith — quarantine: Isolate a member (quarantine role + 28d mute)
 * Prefix command (mirrors the /quarantine slash command).
 */
module.exports = {
    name: "quarantine",
    aliases: ["iso"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-quarantine;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[r;$punish[quarantine;$guildID;$authorID;$get[target];;$message[1;999]]]
$color[$actionColor[quarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[quarantine];$userAvatar[$get[target];64;png]]
$description[**$userTag[$get[target]]** — isolated for review
> $if[$message[1;999]==;No reason provided;$message[1;999]]]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]
    `
};
