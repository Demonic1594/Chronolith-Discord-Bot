/*
 * Chronolith — report: Report a user to the moderators (reason required)
 * Slash command (mirrors the %report prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "report",
        description: "Report a user to the moderators (reason required)",
        options: [
            { type: 6, name: "user", description: "User to report", required: true },
            { type: 3, name: "reason", description: "What happened", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$option[reason]!=;$ephemeral A reason is required.]
$let[ch;$logChannel[$guildID;reports]]
$if[$get[ch]==;
$ephemeral
$interactionReply[Reports are not configured here.]
$stop
]
$let[id;$reportNew[$guildID;$authorID;$option[user];$option[reason]]]
$sendMessage[$get[ch];
$author[🚩 Report #$get[id] • $userTag[$authorID];$userAvatar[$authorID;64;png]]
$color[EF4444]
$description[> $option[reason]]
$addField[Reported user;<@$option[user]>
-# $option[user];true]
$addField[Reported by;<@$authorID>
-# $authorID;true]
$addField[Filed;$discordTimestamp[$getTimestamp;RelativeTime];true]
$footer[Chronolith • Reports]
;false]
$interactionReply[$ephemeral ✅ Report **#$get[id]** filed.]
    `
};
