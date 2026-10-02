/*
 * Chronolith — snipe capture (messageDelete).
 * Stores the newest 5 deleted messages per channel in a guild variable.
 */

module.exports = {
    type: "messageDelete",
    code: `
        $onlyIf[$guildID!=;]
        $onlyIf[$isBot[$authorID]!=true;]
        $let[raw;$getGuildVar[snipe_$channelID;$guildID;]]
$if[$get[raw]==;
$arrayLoad[s]
;
$jsonLoad[s;$get[raw]]
]
        $!jsonLoad[entry;{}]
        $!jsonSet[entry;a;"$authorID"]
        $!jsonSet[entry;c;$messageContent[$channelID;$messageID]]
        $!jsonSet[entry;t;$getTimestamp]
        $arrayUnshift[s;$jsonStringify[entry]]
        $if[$arrayLength[s]>5;
            $!arraySlice[s;s;0;5]
        ]
        $!setGuildVar[snipe_$channelID;$jsonStringify[s];$guildID]
    `
};
