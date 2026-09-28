// Chronolith — roleDelete posts to the configured serverlogs channel.
module.exports = {
    type: "roleDelete",
    code: `
        $let[lch;$logChannel[$guildID;serverlogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];

            ;false]
        ]
    `
};
