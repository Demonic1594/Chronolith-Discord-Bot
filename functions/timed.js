/*
 * Chronolith engine — active timed moderations (flat registries).
 *
 * Reads: tb_all/tb_<uid> (hardbans), timedouts {uid:until} (scalar values,
 * single-dynamic key — proven shape), lkd_all/lkd_<ch> (lockdowns).
 *
 * $timedList[guild] → "bansCSV~~outsCSV~~locksCSV" with "id:until" entries.
 */

module.exports = [
    {
        name: "timedList",
        params: ["guild"],
        code: `
            $let[bans;]
            $let[allb;$getGuildVar[tb_all;$env[guild];]]
            $if[$get[allb]!=;
                $arrayLoad[bu;,;$get[allb]]
                $arrayForEach[bu;u;
                    $if[$env[u]!=;
                        $let[until;$getGuildVar[tb_$env[u];$env[guild];0]]
                        $if[$math[$get[until]-$getTimestamp]>0;
                            $let[bans;$get[bans]$if[$get[bans]!=;,]$env[u]:$get[until]]
                        ]
                    ]
                ]
            ]
            $let[outs;]
            $let[rawtd;$getGuildVar[timedouts;$env[guild];]]
            $if[$get[rawtd]!=;
                $jsonLoad[td;$get[rawtd]]
                $arrayLoad[tkeys;,;$jsonEntries[td]]
                $arrayForEach[tkeys;k;
                    $let[uid;$env[k;0]]
                    $let[until;$env[k;1]]
                    $if[$math[$get[until]-$getTimestamp]>0;
                        $let[outs;$get[outs]$if[$get[outs]!=;,]$get[uid]:$get[until]]
                    ]
                ]
            ]
            $let[locks;]
            $let[alll;$getGuildVar[lkd_all;$env[guild];]]
            $if[$get[alll]!=;
                $arrayLoad[li;,;$get[alll]]
                $arrayForEach[li;c;
                    $if[$env[c]!=;
                        $let[raw;$getGuildVar[lkd_$env[c];$env[guild];{}]]
                        $jsonLoad[e;$get[raw]]
                        $let[locks;$get[locks]$if[$get[locks]!=;,]$env[c]:$env[e;u]]
                    ]
                ]
            ]
            $return[$get[bans]~~$get[outs]~~$get[locks]]
        `
    }
];
