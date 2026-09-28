// Chronolith — roleUpdate → serverlogs channel.
module.exports = {
    type: "roleUpdate",
    code: `
        $let[lch;$logChannel[$guildID;serverlogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];

            ;false]
        ]
    `
};
