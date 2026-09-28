// Chronolith — channelDelete posts to the configured serverlogs channel.
module.exports = {
    type: "channelDelete",
    code: `
        $let[lch;$logChannel[$guildID;serverlogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];

            ;false]
        ]
    `
};
