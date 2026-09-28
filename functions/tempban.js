/*
 * Chronolith engine — scheduled (temporary) bans.
 *
 * $tempbanAdd[guild;user;untilMs;mod;reason]
 *   Bans now and records {u, until, n} in the guild var `tempbans` (JSON array).
 * $tempbanSweep[guild]
 *   Unbans everyone whose time is up (called every 60s from clientReady and
 *   once at startup). Records an auto-unban case for each.
 */

module.exports = [
    {
        // Full tempban flow: ban + schedule + case + modlog + DM.
        // $tempban[guild;mod;target;durationText;reason]
        name: "tempban",
        params: ["guild", "mod", "target", "duration", "reason"],
        code: `
            $let[until;$math[$getTimestamp+$parseMS[$env[duration]]]]
            $ban[$env[guild];$env[target];$env[reason] (temporary — expires $discordTimestamp[$get[until];RelativeTime])]
            $let[rawtb;$getGuildVar[tempbans;$env[guild];]]
$if[$get[rawtb]==;
$arrayLoad[tb]
;
$jsonLoad[tb;$get[rawtb]]
]
            $jsonLoad[e;{}]
            $jsonSet[e;u;$env[target]]
            $jsonSet[e;until;$get[until]]
            $arrayPush[tb;$jsonStringify[e]]
            $setGuildVar[tempbans;$jsonStringify[tb];$env[guild]]
            $let[n;$newCase[$env[guild];tempban;$env[target];$env[mod];$env[duration];$env[reason]]]
            $modlogPost[$env[guild];$get[n];ban;$env[target];$env[mod];$env[duration];$env[reason] (auto-unban $discordTimestamp[$get[until];RelativeTime])]
            $dmNotify[$env[target];$env[guild];ban;$env[duration];$get[n];$env[reason]]
            $return[$get[n]]
        `
    },
    {
        name: "tempbanAdd",
        params: ["guild", "user", "until", "mod", "reason"],
        code: `
            $ban[$env[guild];$env[user];$env[reason] (temporary, expires $discordTimestamp[$env[until];RelativeTime])]
            $let[rawtb;$getGuildVar[tempbans;$env[guild];]]
$if[$get[rawtb]==;
$arrayLoad[tb]
;
$jsonLoad[tb;$get[rawtb]]
]
            $jsonLoad[e;{}]
            $jsonSet[e;u;$env[user]]
            $jsonSet[e;until;$env[until]]
            $arrayPush[tb;$jsonStringify[e]]
            $setGuildVar[tempbans;$jsonStringify[tb];$env[guild]]
            $return[ok]
        `
    },
    {
        name: "tempbanSweep",
        params: ["guild"],
        code: `
            $let[rawtb;$getGuildVar[tempbans;$env[guild];]]
$if[$get[rawtb]==;
$arrayLoad[tb]
;
$jsonLoad[tb;$get[rawtb]]
]
            $let[changed;0]
            $let[now;$getTimestamp]
            $arrayMap[tb;e;
                $if[$math[$env[e;until]-$get[now]]<=0;
                    $letSum[changed;1]
                    $#unban[$env[guild];$env[e;u];Tempban expired]
                    $let[n;$newCase[$env[guild];unban;$env[e;u];$botID;;Tempban expired automatically]]
                    $#modlogPost[$env[guild];$get[n];unban;$env[e;u];$botID;;Tempban expired automatically]
                ;
                    $return[$env[e]]
                ]
            ;tb]
            $setGuildVar[tempbans;$jsonStringify[tb];$env[guild]]
            $return[$get[changed]]
        `
    }
];
