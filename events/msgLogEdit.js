// Chronolith — edited-message log (messageUpdate → msglogs channel).

module.exports = {
    type: "messageUpdate",
    code: `
        $onlyIf[$isBot[$authorID]!=true;]
        $let[lch;$logChannel[$guildID;msglogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $author[✎ $userTag[$authorID];$userAvatar[$authorID;64;png]]
                $color[4E5058]
                $description[**Before**
> $if[$#oldMessage[content]==;*(empty)*;$#oldMessage[content]]

**After**
> $if[$#newMessage[content]==;*(empty)*;$#newMessage[content]]]
                $addField[Channel;<#$channelID>;true]
                $addField[Jump;-# $hyperlink[message;$messageLink[$channelID;$messageID]];true]
                $footer[Chronolith]
            ;false]
        ]
    `
};
