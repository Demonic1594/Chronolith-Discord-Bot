/*
 * Chronolith — reports: List reports by status, or view one by ID
 * Prefix command (mirrors the /reports slash command).
 */
module.exports = {
    name: "reports",
    aliases: ["reportlist"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-reports;3s;]
$let[q;$if[$message[0]!=;$toLowerCase[$message[0]];open]]
$if[$checkCondition[$get[q] + 0 >= 0]==true;
$let[raw;$reportGet[$guildID;$get[q]]]
$onlyIf[$get[raw]!=;Report not found.]
$!jsonLoad[r;$get[raw]]
$author[🚩 Report #$get[q] • $toUpperCase[$env[r;st]];$userAvatar[$botID;64;png]]
$color[$if[$env[r;st]==open;F59E0B;$if[$env[r;st]==claimed;7C3AED;22C55E]]]
$description[> $env[r;rsn]]
$addField[Reported user;<@$env[r;tgt]>;true]
$addField[Reporter;<@$env[r;rep]>;true]
$addField[Filed;$discordTimestamp[$env[r;ts];RelativeTime];true]
$if[$env[r;claimed]!=;
$addField[Claimed by;<@$env[r;claimed]>;true]
]
$if[$env[r;note]!=;
$addField[Resolution note;$env[r;note];false]
]
$footer[Chronolith • Reports]
$stop
]
$onlyIf[$or[$get[q]==open,$or[$get[q]==claimed,$or[$get[q]==resolved,$or[$get[q]==dismissed,$get[q]==all]]]]==true;Usage: reports \\[open|claimed|resolved|dismissed|all\\] or reports <id>]
$let[allr;$reportAll[$guildID]]
$onlyIf[$get[allr]!=;No reports on record.]
$!arrayLoad[rids;,;$get[allr]]
$!arrayLoad[lines;]
$!arrayForEach[rids;id;
$let[raw;$reportGet[$guildID;$env[id]]]
$!jsonLoad[r;$get[raw]]
$if[$or[$get[q]==all,$env[r;st]==$get[q]]==true;
$!arrayPush[lines;-# **$env[id]** · $toUpperCase[$env[r;st]] · <@$env[r;tgt]> · $env[r;rsn]]
]
]
$onlyIf[$arrayLength[lines]>0;No $get[q] reports.]
$if[$arrayLength[lines]>10;
$!arraySlice[lines;lines;$math[$arrayLength[lines]-10];$arrayLength[lines]]]
$author[Reports • $get[q];$userAvatar[$botID;64;png]]
$color[7C3AED]
$description[$arrayJoin[lines;
]]
$footer[Chronolith • newest 10 shown]
    `
};
