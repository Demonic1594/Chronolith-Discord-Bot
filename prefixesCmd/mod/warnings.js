/*
 * Chronolith — warnings: List a user's warnings
 * Prefix command (mirrors the /warnings slash command).
 */
module.exports = {
    name: "warnings",
    aliases: ["warns"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-warnings;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$arrayLoad[cs;,;$get[uc]]
$arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$if[$env[one;t]==warn;$return[-# **#$env[k]** · $env[one;r]]];out]
$author[Warnings • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[F59E0B]
$thumbnail[$userAvatar[$get[target];256;png]]
$description[$arrayJoin[out;
]]
$addField[Active on record;\`$warnCount[$guildID;$get[target]]\`;true]
$footer[Chronolith • Moderation]
    `
};
