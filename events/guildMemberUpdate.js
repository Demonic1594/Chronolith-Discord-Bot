// Chronolith — nickname change log (guildMemberUpdate → serverlogs).
// Only nickname changes are logged (role changes would be spam).

module.exports = {
    type: "guildMemberUpdate",
    code: `
        $nomention
        $try[$let[on;$oldMember[nickname]];$let[on;]]
        $try[$let[nn;$newMember[nickname]];$let[nn;]]
        $if[$get[on]!=$get[nn];
            $let[lch;$logChannel[$guildID;serverlogs]]
            $if[$get[lch]!=;
                $sendMessage[$get[lch];
                    $title[✎ Nickname changed]
                    $color[#4E5058]
                    $description[<@$userID>: **$if[$get[on]==;*(none)*;$get[on]]** → **$if[$get[nn]==;*(none)*;$get[nn]]**]
                    $footer[Chronolith • Server]
                    $timestamp
                ;false]
            ]
        ]
    `
};
