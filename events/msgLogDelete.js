// Chronolith — deleted-message log (messageDelete → msglogs channel).
// Content may be empty for uncached messages; that is Discord behavior.

module.exports = {
    type: "messageDelete",
    code: `
        $nomention
        $onlyIf[$isBot[$authorID]!=true;]
        $try[$let[content;$messageContent[$channelID;$messageID]];$let[content;]]
        $let[lch;$logChannel[$guildID;msglogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $author[✖ $userTag[$authorID];$userAvatar[$authorID;64;png]]
                $color[4E5058]
                $description[$if[$get[content]==;*(empty or uncached)*;$get[content]]]
                $addField[Channel;<#$channelID>;true]
                $addField[Jump;-# deleted messages have no jump link;true]
                $footer[Chronolith]
            ;false]
        ]
    `
};
