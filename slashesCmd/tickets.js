/*
 * Chronolith — tickets: Set the category new tickets are created under
 * Slash command (mirrors the %tickets prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "tickets",
        description: "Set the category new tickets are created under",
        options: [
            { type: 7, name: "channel", description: "Category channel (omit to disable)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[c;$default[$option[channel];]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;tickets;$get[c]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[c]==;Tickets disabled.;✅ Tickets will open under <#$get[c]>.]]
    `
};
