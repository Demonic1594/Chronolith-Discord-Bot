/*
 * Chronolith — warnset: Configure warn escalation
 * Prefix command (mirrors the /warnset slash command).
 */
module.exports = {
    name: "warnset",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-warnset;3s;]
$onlyIf[$message[0]!=;Usage: warnset <threshold> <mute|kick|ban|none> \\[duration\\]]
$onlyIf[$or[$toLowerCase[$message[1]]==none,$or[$toLowerCase[$message[1]]==mute,$or[$toLowerCase[$message[1]]==kick,$toLowerCase[$message[1]]==ban]]]==true;Action must be mute, kick, ban or none.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;warns;threshold;$message[0]]
$!jsonSet[cfg;warns;action;$toLowerCase[$message[1]]]
$!jsonSet[cfg;warns;duration;$if[$message[2]!=;$message[2];1h]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[⚠️ Escalation: $message[0] warns → $toLowerCase[$message[1]]$if[$toLowerCase[$message[1]]==mute; for $if[$message[2]!=;$message[2];1h]].]
    `
};
