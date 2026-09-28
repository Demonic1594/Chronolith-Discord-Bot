/*
 * Chronolith — antinuke: Anti-nuke: watch destructive admin actions
 * Slash command (mirrors the %antinuke prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "antinuke",
        description: "Anti-nuke: watch destructive admin actions",
        options: [
            { type: 3, name: "state", description: "on or off", required: true },
            { type: 4, name: "threshold", description: "Actions within 20s before response (default 3)", required: false },
            { type: 3, name: "action", description: "ban, kick or strip (default ban)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[state;$option[state]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;antinuke;on;$if[$get[state]==on;true;false]]
$if[$get[state]==on;
$!jsonSet[cfg;antinuke;threshold;$if[$option[threshold]==0;;$if[$option[threshold]!=;$option[threshold];3]]]
$!jsonSet[cfg;antinuke;action;$if[$option[action]!=;$option[action];ban]]
]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$description[🛡️ Anti-nuke **$get[state]**.]
$color[EF4444]
$footer[Chronolith • Security]
]
    `
};
