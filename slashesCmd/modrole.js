/*
 * Chronolith — modrole: Add or remove a moderator role
 * Slash command (mirrors the %modrole prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "modrole",
        description: "Add or remove a moderator role",
        options: [
            { type: 3, name: "mode", description: "add or remove", required: true },
            { type: 8, name: "role", description: "Role", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$option[role]]
$let[mode;$option[mode]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!arrayLoad[rs;,;$env[cfg;modroles]]
$if[$get[mode]==add;
$if[$arraySome[rs;x;$checkCondition[$env[x]==$get[r]]]!=true;
$!arrayPush[rs;$get[r]]
$!jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ <@&$get[r]> is now a mod role.]];
$interactionReply[Already a mod role.]
];
$let[i;$arrayIndexOf[rs;$get[r]]]
$if[$get[i]==-1;
$interactionReply[Not a mod role.];
$!arraySplice[rs;$get[i];1]
$!jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ <@&$get[r]> removed from mod roles.]]
]
]
    `
};
