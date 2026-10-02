/*
 * Chronolith — reason: Edit a case's reason
 * Slash command (mirrors the %reason prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "reason",
        description: "Edit a case's reason",
        options: [
            { type: 4, name: "number", description: "Case number", required: true },
            { type: 3, name: "reason", description: "New reason", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$option[reason]!=;$ephemeral Provide the new reason.]
$let[raw;$getGuildVar[case_$option[number];$guildID;]]
$if[$get[raw]==;
$ephemeral
$interactionReply[⛔ Case not found.]
$stop
]
$!jsonLoad[c;$get[raw]]
$!jsonSet[c;r;$option[reason]]
$setGuildVar[case_$option[number];$jsonStringify[c];$guildID]
$interactionReply[✅ Reason updated for case #$option[number].]
    `
};
