/*
 * Chronolith — autorole: Role to give on join
 * Slash command (mirrors the %autorole prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "autorole",
        description: "Role to give on join",
        options: [
            { type: 8, name: "role", description: "Role (omit to disable)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$default[$option[role];]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;autorole;$get[r]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[r]==;Autorole disabled.;✅ Autorole set to <@&$get[r]>.]]
    `
};
