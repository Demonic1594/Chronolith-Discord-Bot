/*
 * Chronolith — case: Inspect a case by number
 * Slash command (mirrors the %case prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "case",
        description: "Inspect a case by number",
        options: [
            { type: 4, name: "number", description: "Case number", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[raw;$caseGet[$guildID;$option[number]]]
$if[$get[raw]==;
$ephemeral
$interactionReply[Case not found.]
$stop
]
$!jsonLoad[c;$get[raw]]
$interactionReply[
$author[Modlog • Case #$option[number];$userAvatar[$env[c;u];64;png]]
$color[$actionColor[$env[c;t]]]
$description[$modlogEntries[$guildID;$option[number]]]
$footer[Chronolith • Modlog • %reason <case#> <text> to edit]
$timestamp
]
    `
};
