/*
 * Chronolith — report: Report a user to the moderators (no mod permissions needed)
 * Prefix command (mirrors the /report slash command).
 */
module.exports = {
    name: "report",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Usage: report <user> \[what happened\]]
$onlyIf[$message[1;999]!=;Tell the mods what happened.]
$let[ch;$modlogChannel[$guildID]]
$onlyIf[$get[ch]!=;Reporting is not configured here (mods: set a modlog channel first).]
$sendMessage[$get[ch];
$author[🚩 Report • $userTag[$authorID];$userAvatar[$authorID;64;png]]
$color[EF4444]
$description[> $message[1;999]]
$addField[Reported user;<@$get[target]>
-# $get[target];true]
$addField[Reported by;<@$authorID>;true]
$addField[Context;-# $hyperlink[jump to message;$messageLink[$channelID;$messageID]] in <#$channelID>;true]
$footer[Chronolith • Reports]
;false]
$description[✅ Report sent to the moderators.]
$deleteIn[10s]
    `
};
