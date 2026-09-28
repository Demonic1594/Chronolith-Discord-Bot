/*
 * Chronolith — startup (clientReady; no user/channel context here).
 * Banner + the tempban sweeper: every 60s every guild's scheduled bans are
 * checked, and one immediate sweep catches expiries during downtime.
 */

module.exports = {
    type: "clientReady",
    code: `
        $log[================================]
        $log[Chronolith online as $username[$botID]]
        $log[Connected to $guildCount guild(s)]
        $log[================================]
        $setInterval[
            $arrayLoad[gs;,;$guildIDs[,]]
            $arrayForEach[gs;g;$tempbanSweep[$env[g]]$lockSweep[$env[g]]
$let[rawtd;$getGuildVar[timedouts;$env[g];]]
$if[$get[rawtd]!=;
$jsonLoad[td;$get[rawtd]]
$arrayForEach[td;k;
$if[$math[$env[td;$env[k]]-$getTimestamp]<=0;
$jsonDelete[td;$env[k]]
]
]
$setGuildVar[timedouts;$jsonStringify[td];$env[g]]
]
$timedList[$env[g]]]
        ;60s;tempsweep]
        $arrayLoad[gs2;,;$guildIDs[,]]
        $arrayForEach[gs2;g2;$tempbanSweep[$env[g2]]$lockSweep[$env[g2]]]
    `
};
