/*
 * Chronolith engine — lockdown v3 (per the command plan).
 *
 * Registry: guild var `lockdowns` = JSON object keyed by channel ID:
 *   { "chID": { r: reason, u: untilMs (0 = indefinite), by: modID } }
 *
 * $lockChan[guild;channel;reason;by]     — deny @everyone SendMessages + register
 * $unlockChan[guild;channel;by]          — restore ONLY if registered; 1 = unlocked, 0 = wasn't locked
 * $lockAll[guild;reason;by]              — locks every text/announcement channel; returns count
 * $unlockAll[guild;by]                   — unlocks every REGISTERED channel; returns count
 * $lockSweep[guild]                      — unlocks channels whose `until` has passed
 *
 * The @everyone role id equals the guild id. Locks are stored so they
 * survive restarts; the ready-interval sweeps expired durations.
 */

module.exports = [
    {
        name: "lockChan",
        params: ["guild", "channel", "reason", "by"],
        code: `
            $removeChannelPerms[$env[channel];$env[guild];SendMessages]
            $jsonLoad[lr;$getGuildVar[lockdowns;$env[guild];{}]]
            $jsonLoad[e;{}]
            $jsonSet[e;r;$env[reason]]
            $jsonSet[e;u;0]
            $jsonSet[e;by;$env[by]]
            $jsonSet[lr;$env[channel];$jsonStringify[e]]
            $setGuildVar[lockdowns;$jsonStringify[lr];$env[guild]]
            $return[1]
        `
    },
    {
        name: "unlockChan",
        params: ["guild", "channel", "by"],
        code: `
            $jsonLoad[lr;$getGuildVar[lockdowns;$env[guild];{}]]
            $if[$env[lr;$env[channel]]==;
                $return[0]
            ]
            $deleteChannelPerms[$env[channel];$env[guild];SendMessages]
            $jsonDelete[lr;$env[channel]]
            $setGuildVar[lockdowns;$jsonStringify[lr];$env[guild]]
            $return[1]
        `
    },
    {
        name: "lockAll",
        params: ["guild", "reason", "by"],
        code: `
            $let[n;0]
            $arrayLoad[chs;,;$guildChannelIDs[$env[guild];,]]
            $arrayForEach[chs;c;
                $if[$env[c]!=;
                    $if[$or[$channelType[$env[c]]==GuildText,$channelType[$env[c]]==GuildNews]==true;
                        $removeChannelPerms[$env[c];$env[guild];SendMessages]
                        $let[n;$math[$get[n]+1]]
                    ]
                ]
            ]
            $jsonLoad[lr;$getGuildVar[lockdowns;$env[guild];{}]]
            $arrayForEach[chs;c2;
                $if[$or[$channelType[$env[c2]]==GuildText,$channelType[$env[c2]]==GuildNews]==true;
                    $jsonLoad[e;{}]
                    $jsonSet[e;r;$env[reason]]
                    $jsonSet[e;u;0]
                    $jsonSet[e;by;$env[by]]
                    $jsonSet[lr;$env[c2];$jsonStringify[e]]
                ]
            ]
            $setGuildVar[lockdowns;$jsonStringify[lr];$env[guild]]
            $return[$get[n]]
        `
    },
    {
        name: "unlockAll",
        params: ["guild", "by"],
        code: `
            $jsonLoad[lr;$getGuildVar[lockdowns;$env[guild];{}]]
            $let[n;0]
            $arrayForEach[lr;c;
                $deleteChannelPerms[$env[c];$env[guild];SendMessages]
                $jsonDelete[lr;$env[c]]
                $letSum[n;1]
            ]
            $setGuildVar[lockdowns;$jsonStringify[lr];$env[guild]]
            $return[$get[n]]
        `
    },
    {
        // Auto-unlock everything whose duration elapsed. Called every 60s.
        name: "lockSweep",
        params: ["guild"],
        code: `
            $jsonLoad[lr;$getGuildVar[lockdowns;$env[guild];{}]]
            $let[now;$getTimestamp]
            $let[n;0]
            $arrayForEach[lr;c;
                $if[$and[$env[lr;$env[c];u]!=0,$math[$env[lr;$env[c];u]-$get[now]]<=0]==true;
                    $deleteChannelPerms[$env[c];$env[guild];SendMessages]
                    $jsonDelete[lr;$env[c]]
                    $letSum[n;1]
                ]
            ]
            $if[$get[n]>0;
                $setGuildVar[lockdowns;$jsonStringify[lr];$env[guild]]
            ]
            $return[$get[n]]
        `
    }
];
