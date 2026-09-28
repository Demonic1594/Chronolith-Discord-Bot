/*
 * Chronolith — muterole: Use a role for mutes instead of timeouts
 * Slash command (mirrors the %muterole prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "muterole",
        description: "Use a role for mutes instead of timeouts",
        options: [
            { type: 8, name: "role", description: "Role (omit for timeouts)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$default[$option[role];]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;muterole;$get[r]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[r]==;Mutes now use timeouts.;✅ Mutes now use <@&$get[r]>.]]
    `
};
