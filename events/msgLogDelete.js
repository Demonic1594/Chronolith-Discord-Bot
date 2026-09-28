// Chronolith — deleted-message log (messageDelete → msglogs channel).
// Content may be empty for uncached messages; that is Discord behavior.

module.exports = {
    type: "messageDelete",
    code: `
        $onlyIf[$isBot[$authorID]!=true;]
        $let[lch;$logChannel[$guildID;msglogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $author[✖ $userTag[$authorID];$userAvatar[$authorID;64;png]]
                $color[64748B]
                $description[$if[$#messageContent[$channelID;$messageID]==;*(empty or uncached)*;$#messageContent[$channelID;$messageID]]]
                $addField[Channel;<#$channelID>;true]
                $addField[Jump;-# deleted messages have no jump link;true]
                $footer[Chronolith • Messages]
            ;false]
        ]
    `
};
