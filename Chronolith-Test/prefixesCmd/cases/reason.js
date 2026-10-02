/*
 * Chronolith — reason: Edit a case's reason
 * Prefix command (mirrors the /reason slash command).
 */
module.exports = {
    name: "reason",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-reason;3s;]
$onlyIf[$message[0]!=;Usage: reason <case#> <new reason>]
$onlyIf[$message[1;999]!=;Provide the new reason.]
$let[raw;$getGuildVar[case_$message[0];$guildID;]]
$if[$get[raw]==;
⛔ Case not found.;
$!jsonLoad[c;$get[raw]]
$!jsonSet[c;r;$message[1;999]]
$setGuildVar[case_$message[0];$jsonStringify[c];$guildID]
✅ Reason updated for case #$message[0].
]
    `
};
