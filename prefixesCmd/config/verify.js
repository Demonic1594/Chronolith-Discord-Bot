/*
 * Chronolith — verify: Join verification (unverified role + DM button)
 * Prefix command (mirrors the /verify slash command).
 */
module.exports = {
    name: "verify",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-verify;3s;]
$if[$message[0]==off;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;verify;role;]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Verification disabled.;
$let[r;$replace[$replace[$message[0];<@&;];>;]]
$onlyIf[$get[r]!=;Usage: verify <role|off> — members joining get the role and a verify button.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;verify;role;$get[r]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Verification enabled — joiners get <@&$get[r]> and a DM button.
]
$footer[Chronolith • Security]
    `
};
