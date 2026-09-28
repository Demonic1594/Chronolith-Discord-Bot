/*
 * Chronolith — slowmode: Set channel slowmode (seconds, or off)
 * Slash command (mirrors the %slowmode prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "slowmode",
        description: "Set channel slowmode (seconds, or off)",
        options: [
            { type: 4, name: "seconds", description: "0 to disable", required: true },
            { type: 7, name: "channel", description: "Channel (default: here)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[s;$option[seconds]]
$onlyIf[$and[$get[s]>=0;$get[s]<=21600]==true;$ephemeral Pick 0-21600 seconds.]
$setChannelSlowmode[$default[$option[channel];$channelID];$get[s]]
$interactionReply[$description[🐢 Slowmode updated to $get[s]s.]]
    `
};
