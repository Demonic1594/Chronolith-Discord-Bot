// Chronolith — member leave log (guildMemberRemove).

module.exports = {
    type: "guildMemberRemove",
    code: `
        $nomention
        $let[lch;$logChannel[$guildID;joinleave]]
        $try[$let[ja;$memberJoinedAt[$guildID;$userID]];$let[ja;]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $author[➖ $userTag[$userID];$userAvatar[$userID;64;png]]
                $color[F23F24]
                $thumbnail[$userAvatar[$userID;256;png]]
                $description[<@$userID>
-# ID: $userID]
                $addField[Joined;$if[$get[ja]==;*unknown*;$discordTimestamp[$get[ja];RelativeTime]];true]
                $footer[Chronolith • Members]
                    $timestamp
            ;false]
        ]
    `
};
