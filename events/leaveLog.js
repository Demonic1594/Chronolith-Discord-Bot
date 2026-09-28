// Chronolith — member leave log (guildMemberRemove).

module.exports = {
    type: "guildMemberRemove",
    code: `
        $let[lch;$logChannel[$guildID;joinleave]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $author[➖ $userTag[$userID];$userAvatar[$userID;64;png]]
                $color[EF4444]
                $thumbnail[$userAvatar[$userID;256;png]]
                $description[<@$userID>
-# ID: $userID]
                $addField[Joined;$if[$#memberJoinedAt[$guildID;$userID]==;*unknown*;$discordTimestamp[$#memberJoinedAt[$guildID;$userID];RelativeTime]];true]
                $footer[Chronolith • Members]
            ;false]
        ]
    `
};
