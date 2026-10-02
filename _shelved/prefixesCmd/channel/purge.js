/*
 * Chronolith — purge: Purge messages with filters (pinned are ignored)
 * Prefix command (mirrors the /purge slash command).
 */
module.exports = {
    name: "purge",
    aliases: ["clean"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-purge;3s;]
$onlyIf[$hasPerms[$guildID;$botID;ManageMessages]==true;⛔ I am missing the Manage Messages permission.]
$let[arg1;$if[$message[0]!=;$message[0];all]]
$let[mode;$if[$checkCondition[$get[arg1] + 0 >= 0]==true;all;$toLowerCase[$get[arg1]]]]
$onlyIf[$or[$get[mode]==all;$or[$get[mode]==bot;$or[$get[mode]==contains;$or[$get[mode]==embeds;$or[$get[mode]==emoji;$or[$get[mode]==files;$or[$get[mode]==images;$or[$get[mode]==links;$or[$get[mode]==mentions;$or[$get[mode]==pings;$or[$get[mode]==human;$get[mode]==reactions]]]]]]]]]]]==true;Usage: purge \\[all\\|bot\\|contains\\|embeds\\|emoji\\|files\\|images\\|links\\|mentions\\|human\\|reactions\\] [search=100] [...]]
$let[search;$if[$checkCondition[$get[arg1] + 0 >= 0]==true;$get[arg1];100]]
$let[extra;$trim[$message[1;999]]]
$let[scan;$scanMessages[$channelID;$if[$get[search]>500;500;$get[search]]]]
$onlyIf[$checkContains[$get[scan];\\[;1]==true;Scan failed — cannot read this channel's history.]
$!jsonLoad[found;$get[scan]]
$let[ids;]
$let[count;0]
$!arrayForEach[found;m;
$if[$and[$env[m;p]!=true;$math[$arrayLength[$arrayLoad[cur;,;$get[ids]]]]<100]==true;
$let[match;0]
$if[$get[mode]==all;
$if[$env[m;a]==$authorID;
$let[match;1]
]
]
$if[$get[mode]==human;
$if[$env[m;b]!=true;
$let[match;1]
]
]
$if[$get[mode]==bot;
$if[$env[m;b]==true;
$if[$get[extra]==;
$let[match;1]
;
$if[$startsWith[$env[m;c];$get[extra]]==true;
$let[match;1]
]
]
]
]
$if[$get[mode]==contains;
$if[$checkContains[$toLowerCase[$env[m;c]];$toLowerCase[$get[extra]]]==true;
$let[match;1]
]
]
$if[$get[mode]==embeds;
$if[$env[m;e]>0;
$let[match;1]
]
]
$if[$get[mode]==emoji;
$if[$checkContains[$env[m;c];<:]==true;
$let[match;1]
]
]
$if[$get[mode]==files;
$if[$env[m;t]>0;
$let[match;1]
]
]
$if[$get[mode]==images;
$if[$or[$env[m;t]>0;$env[m;e]>0]==true;
$let[match;1]
]
]
$if[$get[mode]==links;
$if[$checkContains[$toLowerCase[$env[m;c]];http]==true;
$let[match;1]
]
]
$if[$or[$get[mode]==mentions;$get[mode]==pings]==true;
$if[$env[m;n]>0;
$let[match;1]
]
]
$if[$get[match]==1;
$let[ids;$get[ids]$if[$get[ids]!=;,]$env[m;i]]
$letSum[count;1]
]
]
]
$if[$get[mode]==reactions;
$!arrayForEach[found;m;
$!deleteAllMessageReactions[$channelID;$env[m;i]]
]
Reactions cleared in the last $get[search] messages.;
$if[$get[count]>0;
$let[del;$deleteMessage[$channelID;$replace[$get[ids];,;]]]
🧹 Purged \`$get[del]\` message(s) — \`$get[mode]\` mode.;
🧹 Nothing matched the \`$get[mode]\` filter in the last $get[search] messages.
]
]
$footer[Chronolith • Purge]
$color[5865F2]
    `
};
