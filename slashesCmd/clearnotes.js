/*
 * Chronolith — clearnotes: Clear all notes from one or more targets
 * Slash command (mirrors the %clearnotes prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "clearnotes",
        description: "Clear all notes from one or more targets",
        options: [
            { type: 3, name: "users", description: "Mentions/usernames/IDs", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$!arrayLoad[nt;,;$option[users]]
$let[cleared;0]
$!arrayForEach[nt;u;
$!arrayLoad[ns;,;$userNotes[$guildID;$env[u]]]
$!arrayForEach[ns;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[cleared;1]
]
]
]
$interactionReply[
$description[🧼 Cleared \`$get[cleared]\` note(s).]
$color[248046]
$footer[Chronolith • Notes]
]
    `
};
