/*
 * Chronolith engine — active timed moderations (Phase 1 #1 + #11).
 *
 * Reads the persistent registries (all restart-safe, swept every 60s):
 *   `tempbans`  → JSON array [{u, until}]   (hardbans / timed bans)
 *   `timedouts` → JSON {uid: until}          (timeouts we applied)
 *   `lockdowns` → JSON {ch: {r, u, by}}      (u = 0 for indefinite)
 *
 * $timedList[guild] → "bansCSV~~outsCSV~~locksCSV" where each CSV holds
 *   "id:untilMs" entries (unexpired only). Indefinite locks use until=0.
 * Rendering happens in the command layer.
 */

module.exports = [
    {
        name: "timedList",
        params: ["guild"],
        code: `
            $let[now;$getTimestamp]
            $let[bans;]
            $let[rawtb;$getGuildVar[tempbans;$env[guild];]]
            $if[$get[rawtb]!=;
                $jsonLoad[tb;$get[rawtb]]
                $arrayForEach[tb;e;
                    $if[$math[$env[e;until]-$get[now]]>0;
                        $let[bans;$get[bans]$if[$get[bans]!=;,]$env[e;u]:$env[e;until]]
                    ]
                ]
            ]
            $let[outs;]
            $let[rawtd;$getGuildVar[timedouts;$env[guild];]]
            $if[$get[rawtd]!=;
                $jsonLoad[td;$get[rawtd]]
                $arrayForEach[td;k;
                    $if[$math[$env[td;$env[k]]-$get[now]]>0;
                        $let[outs;$get[outs]$if[$get[outs]!=;,]$env[k]:$env[td;$env[k]]]
                    ]
                ]
            ]
            $let[locks;]
            $jsonLoad[ld;$getGuildVar[lockdowns;$env[guild];{}]]
            $arrayForEach[ld;c;
                $let[locks;$get[locks]$if[$get[locks]!=;,]$env[c]:$env[ld;$env[c];u]]
            ]
            $return[$get[bans]~~$get[outs]~~$get[locks]]
        `
    }
];
