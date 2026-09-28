/*
 * Chronolith — verify: Join verification (unverified role + DM button)
 * Slash command (mirrors the %verify prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "verify",
        description: "Join verification (unverified role + DM button)",
        options: [
            { type: 8, name: "role", description: "Unverified role (omit to disable)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$default[$option[role];]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;verify;role;$get[r]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[r]==;Verification disabled.;✅ Verification enabled.]
$footer[Chronolith • Security]]
    `
};
