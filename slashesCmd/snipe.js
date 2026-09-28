/*
 * Chronolith — snipe: Recover a deleted message (mods only)
 * Slash command (mirrors the %snipe prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "snipe",
        description: "Recover a deleted message (mods only)",
        options: [
            { type: 4, name: "index", description: "0 = newest (default)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[i;$default[$option[index];0]]
$let[e;$snipeGet[$guildID;$channelID;snipe;$get[i]]]
$if[$get[e]==;
$ephemeral
$interactionReply[Nothing to snipe in this channel.]
$stop
]
$!jsonLoad[e;$get[e]]
$interactionReply[
$description[$if[$env[e;c]==;*(empty message)*;$env[e;c]]]
$addField[Author;<@$env[e;a]>;true]
$addField[Deleted;$discordTimestamp[$env[e;t];RelativeTime];true]
$color[95A5A6]
]
    `
};
