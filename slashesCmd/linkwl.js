/*
 * Chronolith — linkwl: Link-filter whitelist domains
 * Slash command (mirrors the %linkwl prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "linkwl",
        description: "Link-filter whitelist domains",
        options: [
            { type: 3, name: "mode", description: "add or remove", required: true },
            { type: 3, name: "domain", description: "Domain e.g. youtube.com", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[d;$toLowerCase[$option[domain]]]
$let[mode;$option[mode]]
$if[$get[mode]==list;
$interactionReply[Use %linkwl list — slash lists soon.]
$stop
]
$onlyIf[$get[d]!=;$ephemeral Provide the domain.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[ds;,;$env[cfg;automod;linkwl]]
$if[$get[mode]==add;
$if[$arrayIncludes[ds;$get[d]]!=true;
$arrayPush[ds;$get[d]]
$!jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ Domain whitelisted.]];
$interactionReply[Already whitelisted.]
];
$let[i;$arrayIndexOf[ds;$get[d]]]
$if[$get[i]==-1;
$interactionReply[Not on the list.];
$arraySplice[ds;$get[i];1]
$!jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ Domain removed.]]
]
]
    `
};
