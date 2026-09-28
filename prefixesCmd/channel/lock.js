/*
 * Chronolith — lock: Lock channels (or the server) — optional duration and/or reason
 * Prefix command (mirrors the /lock slash command).
 */
module.exports = {
    name: "lock",
    aliases: ["lockdown"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-lock;3s;]
$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[raw;$message]
$let[dur;]
$let[reason;]
$let[server;false]
$let[chs;]
$arrayLoad[toks; ;$get[raw]]
$arrayForEach[toks;w;
$if[$get[dur]==;
$if[$and[$charCount[$env[w]]>=2,$checkContains[smhd;$cropText[$env[w];$charCount[$env[w]];$charCount[$env[w]]]]==true,$checkCondition[$cropText[$env[w];1;$math[$charCount[$env[w]]-1]] + 0 >= 0]]==true;
$let[dur;$env[w]]
;
$if[$toLowerCase[$env[w]]==server;
$let[server;true]
;
$if[$startsWith[$env[w];<#];
$let[chs;$get[chs]$replace[$replace[$env[w];<#;];>;]],
$if[$checkCondition[$env[w] + 0 >= 0]==true;
$let[chs;$get[chs]$if[$get[chs]!=;,]$env[w]]
;
$let[reason;$get[reason] $env[w]]
]
]
]
]
;
$let[reason;$get[reason] $env[w]]
]
]
]
$if[$get[chs]==;
$let[chs;$channelID]
]
$if[$get[server]==true;
$let[n;$lockAll[$guildID;$if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]];$authorID]]
$description[🔒 $get[n] channel(s) locked server-wide.$if[$get[dur]!=; Auto-unlock in **$get[dur]**.]
> $if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]]];
$arrayLoad[cl;,;$get[chs]]
$let[n;0]
$arrayForEach[cl;c;
$if[$channelExists[$get[c]]==true;
$lockChan[$guildID;$get[c];$if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]];$authorID]
$letSum[n;1]
]
]
$description[🔒 \`$get[n]\` channel(s) locked.$if[$get[dur]!=; Auto-unlock in **$get[dur]**.]
> $if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]]]
]
$color[EF4444]
$footer[Chronolith • Lockdown]
$if[$get[dur]!=;
$jsonLoad[lr;$getGuildVar[lockdowns;$guildID;{}]]
$arrayForEach[lr;ch;
$jsonSet[lr;$env[ch];u;$math[$getTimestamp+$parseMS[$get[dur]]]]
]
$setGuildVar[lockdowns;$jsonStringify[lr];$guildID]
]
    `
};
