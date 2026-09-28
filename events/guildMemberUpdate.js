// Chronolith — nickname change log (guildMemberUpdate → serverlogs).
// Only nickname changes are logged (role changes would be spam).

module.exports = {
    type: "guildMemberUpdate",
    code: `
        $if[$#oldMember[nick]!=$#newMember[nick];
            $let[lch;$logChannel[$guildID;serverlogs]]
            $if[$get[lch]!=;
                $sendMessage[$get[lch];
                    $title[✎ Nickname changed]
                    $color[64748B]
                    $description[<@$userID>: **$if[$#oldMember[nick]==;*(none)*;$#oldMember[nick]]** → **$if[$#newMember[nick]==;*(none)*;$#newMember[nick]]**]
                    $footer[Chronolith • Server]
                    $timestamp
                ;false]
            ]
        ]
    `
};
