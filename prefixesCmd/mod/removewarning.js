/*
 * Chronolith — removewarning: Remove warnings by their case IDs
 * Prefix command (mirrors the /removewarning slash command).
 */
module.exports = {
    name: "removewarning",
    aliases: ["removewarnings", "deletewarning", "deletewarnings", "delwarn", "delwarns"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-removewarning;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$let[removed;0]
$arrayLoad[wids; ;$message[1;999]]
$arrayForEach[wids;w;
$let[d;$caseRemove[$guildID;$env[w]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;None of those case IDs exist for that user.]
$description[🗑️ Removed \`$get[removed]\` warning(s) from <@$get[target]>.]
$color[22C55E]
$footer[Chronolith • Moderation]
    `
};
