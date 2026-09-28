/*
 * Chronolith — moderations: Show active timed bans, timeouts and lockdowns
 * Prefix command (mirrors the /moderations slash command).
 */
module.exports = {
    name: "moderations",
    aliases: ["timedmoderations", "timed"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-moderations;3s;]
$let[all;$timedList[$guildID]]
$arrayLoad[parts;~~;$get[all]]
$let[bans;$arrayAt[parts;0]]
$let[outs;$arrayAt[parts;1]]
$let[locks;$arrayAt[parts;2]]
$let[bl;]
$if[$get[bans]!=;
$arrayLoad[bs;,;$get[bans]]
$arrayForEach[bs;e;
$let[uid;$advancedTextSplit[$env[e];:;0]]
$let[until;$advancedTextSplit[$env[e];:;1]]
$let[bl;$get[bl]🔨 <@$get[uid]> — banned, ends $discordTimestamp[$get[until];RelativeTime]
]
]
]
$let[ol;]
$if[$get[outs]!=;
$arrayLoad[os;,;$get[outs]]
$arrayForEach[os;e;
$let[uid;$advancedTextSplit[$env[e];:;0]]
$let[until;$advancedTextSplit[$env[e];:;1]]
$let[ol;$get[ol]🔇 <@$get[uid]> — timed out, ends $discordTimestamp[$get[until];RelativeTime]
]
]
]
$let[ll;]
$if[$get[locks]!=;
$arrayLoad[ls;,;$get[locks]]
$arrayForEach[ls;e;
$let[cid;$advancedTextSplit[$env[e];:;0]]
$let[until;$advancedTextSplit[$env[e];:;1]]
$let[ll;$get[ll]🔒 <#$get[cid]> — locked$if[$get[until]!=0;, ends $discordTimestamp[$get[until];RelativeTime];, indefinitely]
]
]
]
$if[$and[$get[bl]==;$and[$get[ol]==;$get[ll]==]]==true;
$description[No active timed moderations.]
$color[64748B];
$addField[Hardbans / timed bans;$if[$get[bl]==;*none*;$get[bl]];false]
$addField[Timeouts;$if[$get[ol]==;*none*;$get[ol]];false]
$addField[Lockdowns;$if[$get[ll]==;*none*;$get[ll]];false]
$color[7C3AED]
]
$author[Active timed moderations;$userAvatar[$botID;64;png]]
$footer[Chronolith • All entries survive restarts]
    `
};
