// Chronolith — channelUpdate → serverlogs channel.
module.exports = {
    type: "channelUpdate",
    code: `
        $let[lch;$logChannel[$guildID;serverlogs]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];

            ;false]
        ]
    `
};
