// Chronolith — channelUpdate → serverlogs channel.
module.exports = {
    type: "channelUpdate",
    code: `
        $let[lch;$logChannel[$guildID;serverlogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $title[Channel updated]
                $color[5865F2]
                $timestamp
            ;false]
        ]
    `
};
