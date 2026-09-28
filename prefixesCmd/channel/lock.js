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
$let[dur;]
$let[reason;]
$let[server;0]
$let[chs;]
$arrayLoad[toks; ;$message]
$arrayForEach[toks;w;
$let[cls;reason]
$if[$toLowerCase[$env[w]]==server;
$let[cls;server]
]
$if[$and[$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true;$isNumber[$env[w]]!=true]==true;
$let[cls;dur]
]
$if[$and[$or[$startsWith[$env[w];<#]==true;$isNumber[$env[w]]==true]==true;$get[cls]==reason]==true;
$let[cls;ch]
]
$if[$get[cls]==dur;
$let[dur;$env[w]]
$let[cls;done]
]
$if[$get[cls]==server;
$let[server;1]
$let[cls;done]
]
$if[$get[cls]==ch;
$let[chs;$get[chs]$if[$get[chs]!=;,]$replace[$replace[$env[w];<#;];>;]]
$let[cls;done]
]
$if[$get[cls]==reason;
$let[reason;$get[reason] $env[w]]
]
]
$if[$get[chs]==;
$let[chs;$channelID]
]
$let[until;0]
$if[$get[dur]!=;
$let[until;$math[$getTimestamp+$parseMS[$get[dur]]]]
]
$let[n;0]
$if[$get[server]==1;
$let[n;$lockAll[$guildID;$if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]];$authorID;$get[until]]]
;
$arrayLoad[cl;,;$get[chs]]
$arrayForEach[cl;c;
$if[$and[$channelExists[$env[c]]==true;$get[server]==0]==true;
$lockChan[$guildID;$env[c];$if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]];$authorID;$get[until]]
$letSum[n;1]
]
]
]
$let[casen;$newCase[$guildID;lock;$botID;$authorID;$if[$get[dur]!=;$get[dur];];Locked $get[n] channel(s): $if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]]]]
$let[ml;$modlogPost[$guildID;$get[casen];lock;$botID;$authorID;$if[$get[dur]!=;$get[dur];];Lockdown of $get[n] channel(s)]]
$description[Locked \`$get[n]\` channel(s)$if[$get[dur]!=;, auto-unlock in $get[dur]].
> $if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]]]
$color[EF4444]
$footer[Chronolith • Lockdown]
    `
};
