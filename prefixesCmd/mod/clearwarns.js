/*
 * Chronolith — clearwarns: Clear all warnings from one or more targets
 * Prefix command (mirrors the /clearwarns slash command).
 */
module.exports = {
    name: "clearwarns",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-clearwarns;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found.]
$let[cleared;0]
$!arrayLoad[ct;,;$env[tj;ids]]
$!arrayForEach[ct;u;
$let[c;$warnsRemove[$guildID;$env[u]]]
$letSum[cleared;$get[c]]
]
$description[🧼 Cleared \`$get[cleared]\` warning(s).]
$color[22C55E]
$footer[Chronolith • Moderation]
    `
};
