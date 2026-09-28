/*
 * Chronolith engine — lockdown, flat registry edition.
 *
 * Registry (proven-safe shapes):
 *   `lkd_<ch>`  → JSON {r: reason, u: untilMs(0=indef), by: mod} — literal keys
 *   `lkd_all`   → CSV of locked channel ids
 *
 * $lockChan[guild;channel;reason;by;until]   → deny + register
 * $unlockChan[guild;channel]                 → 1 unlocked / 0 wasn't locked
 * $lockAll[guild;reason;by;until]            → count locked
 * $unlockAll[guild]                          → count unlocked
 * $lockSweep[guild]                          → auto-unlock expired, count
 */

module.exports = [
    {
        name: "lockChan",
        params: ["guild", "channel", "reason", "by", "until"],
        code: `
            $removeChannelPerms[$env[channel];$env[guild];SendMessages]
            $jsonLoad[e;{}]
            $jsonSet[e;r;$env[reason]]
            $jsonSet[e;u;$env[until]]
            $jsonSet[e;by;"$env[by]"]
            $setGuildVar[lkd_$env[channel];$jsonStringify[e];$env[guild]]
            $let[all;$getGuildVar[lkd_all;$env[guild];]]
            $let[idxcheck;0]
$arrayLoad[idx;,;$get[all]]
$arrayForEach[idx;ix;
$if[$env[ix]==$env[channel];
$let[idxcheck;1]
]
]
$if[$get[idxcheck]==0;
                $if[$get[all]!=;
                    $setGuildVar[lkd_all;$get[all],$env[channel];$env[guild]];
                    $setGuildVar[lkd_all;$env[channel];$env[guild]]
                ]
            ]
            $return[1]
        `
    },
    {
        name: "unlockChan",
        params: ["guild", "channel"],
        code: `
            $let[raw;$getGuildVar[lkd_$env[channel];$env[guild];]]
            $if[$get[raw]==;
                $return[0]
            ]
            $deleteChannelPerms[$env[channel];$env[guild];SendMessages]
            $setGuildVar[lkd_$env[channel];;$env[guild]]
            $arrayLoad[idx;,;$getGuildVar[lkd_all;$env[guild];]]
            $let[i;$arrayIndexOf[idx;$env[channel]]]
            $if[$get[i]!=-1;
                $arraySplice[idx;$get[i];1]
                $setGuildVar[lkd_all;$arrayJoin[idx;,];$env[guild]]
            ]
            $return[1]
        `
    },
    {
        name: "lockAll",
        params: ["guild", "reason", "by", "until"],
        code: `
            $let[n;0]
            $arrayLoad[chs;,;$guildChannelIDs[$env[guild];,]]
            $arrayForEach[chs;c;
                $if[$env[c]!=;
                    $if[$or[$channelType[$env[c]]==GuildText;$channelType[$env[c]]==GuildNews]==true;
                        $lockChan[$env[guild];$env[c];$env[reason];$env[by];$env[until]]
                        $letSum[n;1]
                    ]
                ]
            ]
            $return[$get[n]]
        `
    },
    {
        name: "unlockAll",
        params: ["guild"],
        code: `
            $let[all;$getGuildVar[lkd_all;$env[guild];]]
            $if[$get[all]==;
                $return[0]
            ]
            $arrayLoad[idx;,;$get[all]]
            $let[n;0]
            $arrayForEach[idx;c;
                $unlockChan[$env[guild];$env[c]]
                $letSum[n;1]
            ]
            $return[$get[n]]
        `
    },
    {
        name: "lockSweep",
        params: ["guild"],
        code: `
            $let[all;$getGuildVar[lkd_all;$env[guild];]]
            $if[$get[all]==;
                $return[0]
            ]
            $arrayLoad[idx;,;$get[all]]
            $let[n;0]
            $arrayForEach[idx;c;
                $let[raw;$getGuildVar[lkd_$env[c];$env[guild];{}]]
                $jsonLoad[e;$get[raw]]
                $if[$and[$env[e;u]!=0;$math[$env[e;u]-$getTimestamp]<=0]==true;
                    $unlockChan[$env[guild];$env[c]]
                    $letSum[n;1]
                ]
            ]
            $return[$get[n]]
        `
    }
];
