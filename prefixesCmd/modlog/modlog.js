/*
 * Chronolith — modlog: the moderation log viewer (Components V2 edition, v2).
 *
 *   %modlog                          → newest page of recent activity
 *   %modlog recent                   → same
 *   %modlog <action>                 → all cases of that action (e.g. %modlog lock)
 *   %modlog <user>                   → that user's cases (mention, ID or name)
 *   %modlog "Ha ra" <action>         → quoted name with spaces + optional action filter
 *   %modlog user <target> <action>   → explicit user mode (quoted names work here too)
 *   %modlog action <type>            → explicit action mode
 *   %modlog set                      → show the current modlog channel
 *   %modlog set <#channel|ID|off>    → set / disable the modlog channel (Manage Server)
 *   Unknown input → usage (+ a reason when there is one) + action types on record.
 *
 * What changed vs v1:
 *   - FIX  explicit "user" mode never resolved its target / filter (now does; bad target → usage + reason)
 *   - FIX  cfg.modlog is quote-wrapped before $jsonSet (bare snowflakes lose precision past 2^53)
 *   - FIX  empty $arrayLoad phantom element ([""] → length 1) inflated "1 case(s)" for users with none
 *   - FIX  "Jump to action" select could exceed Discord's 25-option cap → capped at 24 + Recent
 *   - FIX  page counts clamped to >= 1 (no more "Page 0 of 0")
 *   - FIX  "%modlog action" with no type now shows usage instead of an empty result
 *   - NEW  action words are case-insensitive (%modlog LOCK)
 *   - NEW  %modlog set validates the channel (exists + belongs to this guild) and requires
 *          Manage Server / Administrator / owner (a plain mod could redirect the log before)
 *   - NEW  %modlog set with no argument shows the current channel
 *   - REFACTOR  the container/select/buttons were copy-pasted 3x → built once from per-mode variables
 *
 * CustomIDs are unchanged (components.js router stays compatible):
 *   mlogs-back-<page> / mlogs-fwd-<page>                 (recent)
 *   mlogu-back-<userID>-<page> / mlogu-fwd-<userID>-<page>   (user)
 *   mloga-back-<type>-<page> / mloga-fwd-<type>-<page>   (action)
 *   pgr-<page>-of-<pages> (inert label)   mlogsel (select)
 *
 * IMPORTANT (router side): button/select clicks bypass this file's gates. components.js must
 * re-check $isMod for the clicker before editing the message.
 *
 * Rules this file follows (see wisdom/): no literal [ or ] in any text, no semicolons in
 * message text, #-prefixed 4E5058, snowflakes quote-wrapped into JSON, one $cooldown only.
 */
module.exports = {
    name: "modlog",
    aliases: ["modlogs"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-modlog;3s;]

$let[total;$getGuildVar[caseCount;$guildID;0]]
$let[acts;$modlogActions[$guildID]]
$let[a0raw;$message[0]]
$let[a0;$toLowerCase[$get[a0raw]]]
$let[mode;]
$let[target;]
$let[filter;]
$let[atype;]
$let[err;]
$let[qname;]
$let[uid;]
$let[uid2;]

$c[ ───────── mode detection (first match wins) ───────── ]

$if[$or[$get[a0]==;$get[a0]==recent]==true;
$let[mode;recent]
]

$if[$get[a0]==set;
$let[mode;set]
]

$if[$get[a0]==action;
$let[mode;action]
$let[atype;$toLowerCase[$trim[$message[1]]]]
$if[$get[atype]==;
$let[mode;usage]
$let[err;Give an action type after action, for example lock.]
]
]

$if[$get[a0]==user;
$let[mode;user]
$!arrayLoad[uq;";$message]
$let[qname;$trim[$message[1]]]
$let[filter;$toLowerCase[$trim[$message[2]]]]
$if[$arrayLength[uq]>=2;
$let[qname;$trim[$arrayAt[uq;1]]]
$let[filter;$toLowerCase[$trim[$arrayAt[uq;2]]]]
]
$if[$get[qname]!=;
$let[target;$findUser[$get[qname]]]
]
$if[$get[target]==;
$let[mode;usage]
$let[err;I could not find that user. Use a mention, an ID, or a quoted name.]
]
]

$if[$get[mode]==;
$if[$checkContains[,$get[acts],;,$get[a0],]==true;
$let[mode;action]
$let[atype;$get[a0]]
]
]

$if[$get[mode]==;
$!arrayLoad[q;";$message]
$if[$arrayLength[q]>=2;
$let[qname;$trim[$arrayAt[q;1]]]
$if[$get[qname]!=;
$let[uid;$findUser[$get[qname]]]
$if[$get[uid]!=;
$let[mode;user]
$let[target;$get[uid]]
$let[filter;$toLowerCase[$trim[$arrayAt[q;2]]]]
]
]
]
]

$if[$get[mode]==;
$let[uid2;$findUser[$get[a0raw]]]
$if[$get[uid2]!=;
$let[mode;user]
$let[target;$get[uid2]]
$let[filter;$toLowerCase[$trim[$message[1]]]]
]
]

$if[$get[mode]==;
$let[mode;usage]
]

$c[ ───────── set: show / change the modlog channel ───────── ]

$if[$get[mode]==set;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$let[curr;$env[cfg;modlog]]
$let[raw;$trim[$message[1]]]
$let[c;$trim[$replace[$replace[$get[raw];<#;];>;]]]
$let[canSet;$or[$guildOwnerID[$guildID]==$authorID;$hasAnyPerms[$guildID;$authorID;ManageGuild;Administrator]==true]]
$let[state;set]
$if[$get[raw]==;
$let[state;view]
]
$if[$get[raw]==off;
$let[state;off]
]
$if[$and[$get[raw]!=;$get[canSet]!=true]==true;
$let[state;denied]
]
$if[$get[state]==set;
$if[$channelExists[$get[c]]!=true;
$let[state;badchan]
]
]
$if[$get[state]==set;
$if[$channelGuildID[$get[c]]!=$guildID;
$let[state;badchan]
]
]
$if[$get[state]==off;
$!jsonSet[cfg;modlog;""]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
]
$if[$get[state]==set;
$!jsonSet[cfg;modlog;"$get[c]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
]
$addContainer[
$addTextDisplay[## ⚙️ Modlog channel
$if[$get[state]==view;$if[$get[curr]==;No modlog channel is set.;Modlog channel is <#$get[curr]>.]]$if[$get[state]==off;Modlog channel disabled.]$if[$get[state]==set;Modlog channel set to <#$get[c]>.]$if[$get[state]==denied;⛔ Changing the modlog channel needs Manage Server or Administrator.]$if[$get[state]==badchan;I could not find that channel in this server. Use a channel mention or its ID.]]
;5865F2]
]

$c[ ───────── browse modes: just compute the variables ───────── ]

$if[$get[mode]==recent;
$let[pages;$pageCount[$get[total]]]
$if[$get[pages]<1;
$let[pages;1]
]
$let[page;$get[pages]]
$let[body;$modlogPage[$guildID;$get[page]]]
$let[head;## 📋 Modlog — recent activity]
$let[sub;-# $get[total] case(s) on record · page $get[page] of $get[pages]]
$let[empty;*No mod logs as of yet — the slate is clean.*]
$let[idBack;mlogs-back-$get[page]]
$let[idFwd;mlogs-fwd-$get[page]]
]

$if[$get[mode]==action;
$let[body;$modlogActionPage[$guildID;$get[atype];1]]
$let[pages;$modlogActionPages[$guildID;$get[atype]]]
$if[$get[pages]<1;
$let[pages;1]
]
$let[page;1]
$let[head;## 🎯 Modlog — $toUpperCase[$get[atype]] cases]
$let[sub;-# Page 1 of $get[pages] · newest first]
$let[empty;*No cases of that type in the last 200.*]
$let[idBack;mloga-back-$get[atype]-1]
$let[idFwd;mloga-fwd-$get[atype]-1]
]

$if[$get[mode]==user;
$let[unums;$if[$get[filter]==;$getGuildVar[ulist_$get[target];$guildID;];$modlogUserFilter[$guildID;$get[target];$get[filter]]]]
$!arrayLoad[uarr;,;$get[unums]]
$let[ucount;$if[$get[unums]==;0;$arrayLength[uarr]]]
$let[pages;$pageCount[$get[ucount]]]
$if[$get[pages]<1;
$let[pages;1]
]
$let[page;$get[pages]]
$let[nums;]
$let[ptr;$math[($get[page]-1)*5]]
$loop[5;
$if[$get[ptr]>=$get[ucount];
$break
]
$let[nums;$get[nums]$if[$get[nums]!=;,]$arrayAt[uarr;$get[ptr]]]
$let[ptr;$math[$get[ptr]+1]]
]
$let[body;$modlogEntries[$guildID;$get[nums]]]
$let[head;## 👤 Modlog — $userTag[$get[target]]$if[$get[filter]!=; · $get[filter] cases]]
$let[sub;-# $get[ucount] case(s) on record · page $get[page] of $get[pages]]
$let[empty;*No cases on record.$if[$get[filter]!=; of that type.]*]
$let[idBack;mlogu-back-$get[target]-$get[page]]
$let[idFwd;mlogu-fwd-$get[target]-$get[page]]
]

$c[ ───────── one shared render for all three browse modes ───────── ]

$if[$or[$get[mode]==recent;$or[$get[mode]==action;$get[mode]==user]]==true;
$let[backDis;$if[$get[page]<=1;true;false]]
$let[fwdDis;$if[$get[page]>=$get[pages];true;false]]
$!arrayLoad[al;,;$get[acts]]
$let[alen;$if[$get[acts]==;0;$arrayLength[al]]]
$let[oi;0]
$addContainer[
$addTextDisplay[$get[head]
$get[sub]]
$addSeparator[Large;true]
$addTextDisplay[$if[$get[body]==;$get[empty];$get[body]]]
$addSeparator[Small;true]
$addTextDisplay[-# %reason <case#> <text> to edit a case]
$addActionRow
$addStringSelectMenu[mlogsel;Jump to action…]
$addOption[📋 Recent;All recent cases;recent]
$loop[24;
$if[$get[oi]>=$get[alen];
$break
]
$let[a;$arrayAt[al;$get[oi]]]
$if[$get[a]!=;
$addOption[$toUpperCase[$get[a]] cases;Every $get[a] case on record;$get[a]]
]
$let[oi;$math[$get[oi]+1]]
]
$addActionRow
$addButton[$get[idBack];◀;Primary;;$get[backDis]]
$addButton[pgr-$get[page]-of-$get[pages];Page $get[page] of $get[pages];Secondary;;true]
$addButton[$get[idFwd];▶;Primary;;$get[fwdDis]]
;5865F2]
]

$c[ ───────── usage (also the landing spot for bad input) ───────── ]

$if[$get[mode]==usage;
$addContainer[
$if[$get[err]!=;
$addTextDisplay[⚠️ $get[err]]
]
$addTextDisplay[## 📋 Modlog — usage
%modlog — newest page of recent activity
%modlog <action> — every case of one action type
%modlog <user> — a user's cases (mention, ID, or quoted name)
%modlog user <target> <action> — a user's cases, optionally filtered by action
%modlog "Ha ra" <action> — quoted name with spaces + action filter
%modlog set — show the modlog channel
%modlog set <#channel|off> — set or disable the modlog channel
**Action types on record:** $if[$get[acts]==;*none yet*;$replace[$get[acts];,;, ]]]
;#4E5058]
]
    `
};
