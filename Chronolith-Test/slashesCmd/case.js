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
$let[raw;$getGuildVar[case_$option[number];$guildID;]]
$if[$get[raw]==;
$ephemeral
$interactionReply[Case not found.]
$stop
]
$!jsonLoad[c;$get[raw]]
$interactionReply[
$author[Modlog • Case #$option[number];$userAvatar[$env[c;u];64;png]]
$color[$if[$or[$env[c;t]==ban;$or[$env[c;t]==kick;$or[$env[c;t]==hardban;$or[$env[c;t]==softban;$or[$env[c;t]==lock;$env[c;t]==nuke]]]]]==true;F23F24;$if[$env[c;t]==unban;#248046;5865F2]]]
$description[$modlogEntries[$guildID;$option[number]]]
$footer[Chronolith • Modlog • %reason <case#> <text> to edit]
$timestamp
]
    `
};
