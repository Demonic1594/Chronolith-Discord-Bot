/*
 * Chronolith — editsnipe: Show a message's text before it was edited (mods only)
 * Slash command (mirrors the %editsnipe prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "editsnipe",
        description: "Show a message's text before it was edited (mods only)",
        options: [
            { type: 4, name: "index", description: "0 = newest (default)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[e;$snipeGet[$guildID;$channelID;esnipe;$default[$option[index];0]]]
$if[$get[e]==;
$ephemeral
$interactionReply[No recent edits in this channel.]
$stop
]
$!jsonLoad[e;$get[e]]
$interactionReply[
$description[**Before:** $env[e;before]
**After:** $env[e;after]]
$addField[Author;<@$env[e;a]>;true]
$color[#4E5058]
]
    `
};
