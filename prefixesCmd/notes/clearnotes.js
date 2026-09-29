/*
 * Chronolith — clearnotes: Clear all notes from one or more targets
 * Prefix command (mirrors the /clearnotes slash command).
 */
module.exports = {
    name: "clearnotes",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-clearnotes;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found.]
$let[cleared;0]
$!arrayLoad[nt;,;$env[tj;ids]]
$!arrayForEach[nt;u;
$!arrayLoad[ns;,;$userNotes[$guildID;$env[u]]]
$!arrayForEach[ns;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[cleared;1]
]
]
]
$description[🧼 Cleared \`$get[cleared]\` note(s).]
$color[248046]
$footer[Chronolith • Notes]
    `
};
