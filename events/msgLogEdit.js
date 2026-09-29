// Chronolith — edited-message log (messageUpdate → msglogs channel).

module.exports = {
    type: "messageUpdate",
    code: `
        $nomention
        $onlyIf[$isBot[$authorID]!=true;]
        $try[$let[oldc;$oldMessage[content]];$let[oldc;]]
        $try[$let[newc;$newMessage[content]];$let[newc;]]
        $let[lch;$logChannel[$guildID;msglogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $author[✎ $userTag[$authorID];$userAvatar[$authorID;64;png]]
                $color[4E5058]
                $description[**Before**
> $if[$get[oldc]==;*(empty)*;$get[oldc]]

**After**
> $if[$get[newc]==;*(empty)*;$get[newc]]]
                $addField[Channel;<#$channelID>;true]
                $addField[Jump;-# $hyperlink[message;$messageLink[$channelID;$messageID]];true]
                $footer[Chronolith • Message Logs]
                    $timestamp
            ;false]
        ]
    `
};
