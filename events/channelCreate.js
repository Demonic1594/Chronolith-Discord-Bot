// Chronolith — channelCreate posts to the configured serverlogs channel.
module.exports = {
    type: "channelCreate",
    code: `
        $let[lch;$logChannel[$guildID;serverlogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $title[Channel created]
                $color[248046]
                $timestamp
            ;false]
        ]
    `
};
