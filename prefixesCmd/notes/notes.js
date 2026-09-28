/*
 * Chronolith — notes: Show a user's staff notes (first target only)
 * Prefix command (mirrors the /notes slash command).
 */
module.exports = {
    name: "notes",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-notes;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[ns;$userNotes[$guildID;$get[target]]]
$onlyIf[$get[ns]!=;No notes on record for that user.]
$!arrayLoad[ns;,;$get[ns]]
$!arrayMap[ns;n;$jsonLoad[one;$noteGet[$guildID;$env[n]]]$return[-# **#$env[n]** · <@$env[one;by]> · $discordTimestamp[$env[one;ts];RelativeTime]
> $env[one;c]];out]
$author[Notes • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[7C3AED]
$thumbnail[$userAvatar[$get[target];256;png]]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[ns] note(s)]
    `
};
