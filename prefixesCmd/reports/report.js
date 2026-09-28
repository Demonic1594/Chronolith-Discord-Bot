/*
 * Chronolith — report: Report a user to the moderators (reason required)
 * Prefix command (mirrors the /report slash command).
 */
module.exports = {
    name: "report",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Usage: report <user> <reason>]
$onlyIf[$message[1;999]!=;A reason is required.]
$!jsonLoad[rcfg;$getGuildVar[cfg;$guildID;{}]]
$let[ch;$env[rcfg;reports]]
$onlyIf[$get[ch]!=;Reports are not configured here (mods: %setreportchannel).]
$let[id;$reportNew[$guildID;$authorID;$get[target];$message[1;999]]]
$sendMessage[$get[ch];
$author[🚩 Report #$get[id] • $userTag[$authorID];$userAvatar[$authorID;64;png]]
$color[EF4444]
$description[> $message[1;999]]
$addField[Reported user;<@$get[target]>
-# $get[target];true]
$addField[Reported by;<@$authorID>
-# $authorID;true]
$addField[Filed;$discordTimestamp[$getTimestamp;RelativeTime];true]
$addField[Context;-# $hyperlink[jump to message;$messageLink[$channelID;$messageID]] in <#$channelID>;true]
$footer[Chronolith • Reports • %claim $get[id] to take it]
;false]
$description[✅ Report **#$get[id]** filed.]
$deleteIn[10s]
    `
};
