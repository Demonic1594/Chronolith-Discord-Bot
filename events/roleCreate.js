// Chronolith — roleCreate posts to the configured serverlogs channel.
module.exports = {
    type: "roleCreate",
    code: `
        $let[lch;$logChannel[$guildID;serverlogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];

            ;false]
        ]
    `
};
