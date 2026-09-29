/*
 * Chronolith — cases: A user's full case history (10 per page)
 * Prefix command (mirrors the /cases slash command).
 */
module.exports = {
    name: "cases",
    aliases: ["infractions", "history"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-cases;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$!arrayLoad[cs;,;$get[uc]]
$!arrayLoad[out;]
$!arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$return[-# **#$env[k]** $actionEmoji[$env[one;t]] · $env[one;r]];out]
$author[History • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[5865F2]
$thumbnail[$userAvatar[$get[target];256;png]]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[cs] case(s)]
    `
};
