/*
 * Chronolith — edit-snipe capture (messageUpdate).
 * Stores the newest 5 edits per channel: { a, before, after, t }.
 * Old content comes from the event's cached old state and may be empty for
 * uncached messages — that is expected Discord behavior.
 */

module.exports = {
    type: "messageUpdate",
    code: `
        $nomention
        $onlyIf[$guildID!=;]
        $onlyIf[$isBot[$authorID]!=true;]
        $let[raw;$getGuildVar[esnipe_$channelID;$guildID;]]
$if[$get[raw]==;
$arrayLoad[s]
;
$jsonLoad[s;$get[raw]]
]
        $!jsonLoad[entry;{}]
        $!jsonSet[entry;a;"$authorID"]
        $!jsonSet[entry;before;$oldMessage[content]]
        $!jsonSet[entry;after;$newMessage[content]]
        $!jsonSet[entry;t;$getTimestamp]
        $arrayUnshift[s;$jsonStringify[entry]]
        $if[$arrayLength[s]>5;
            $!arraySlice[s;s;0;5]
        ]
        $!setGuildVar[esnipe_$channelID;$jsonStringify[s];$guildID]
    `
};
