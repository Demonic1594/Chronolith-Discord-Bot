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
$description[Case #$option[number] — $toUpperCase[$env[c;t]]]
$color[5865F2]
$addField[User;<@$env[c;u]>;true]
$addField[Moderator;<@$env[c;m]>;true]
$addField[Duration;$if[$env[c;d]==;n/a;$env[c;d]];true]
$addField[Reason;$env[c;r];false]
$addField[When;$discordTimestamp[$env[c;ts];RelativeTime];true]
]
    `
};
