/*
 * Chronolith — unlock: Unlock channels (or every locked channel with 'server')
 * Prefix command (mirrors the /unlock slash command).
 */
module.exports = {
    name: "unlock",
    aliases: ["unlockdown"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unlock;3s;]
$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[reason;$if[$message==;no reason;$message]]
$let[server;0]
$let[chs;]
$arrayLoad[toks; ;$message]
$arrayForEach[toks;w;
$if[$toLowerCase[$env[w]]==server;
$let[server;1]
;
$if[$startsWith[$env[w];<#];
$let[chs;$get[chs]$replace[$replace[$env[w];<#;];>;]],
$if[$checkCondition[$env[w] + 0 >= 0]==true;
$let[chs;$get[chs]$if[$get[chs]!=;,]$env[w]]
]
]
]
]
$if[$get[chs]==;
$let[chs;$channelID]
]
$let[n;0]
$if[$get[server]==1;
$let[n;$unlockAll[$guildID]]
;
$arrayLoad[cl;,;$get[chs]]
$arrayForEach[cl;c;
$let[u;$unlockChan[$guildID;$get[c]]]
$if[$get[u]==1;
$letSum[n;1]
]
]
]
$if[$get[n]>0;
$description[🔓 \`$get[n]\` channel(s) unlocked.
> $get[reason]]
$color[22C55E]
;
$description[🔓 No channels were locked.]
$color[64748B]
]
$footer[Chronolith • Lockdown]
    `
};
