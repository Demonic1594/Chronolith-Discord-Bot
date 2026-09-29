/*
 * Chronolith engine — scheduled bans (hardban), flat registry edition.
 *
 * Registry (all proven-safe shapes: scalars + CSV indexes + dynamic var names):
 *   `tb_<uid>`   → expiry ms (scalar)
 *   `tb_all`     → CSV of banned user ids
 *
 * $tempban[guild;mod;target;durationText;reason] → full flow, returns case id
 * $tempbanSweep[guild] → unbans expired entries, returns count
 */

module.exports = [
    {
        name: "tempban",
        params: ["guild", "mod", "target", "duration", "reason"],
        code: `
            $let[until;$math[$getTimestamp+$durationToMs[$env[duration]]]]
            $ban[$env[guild];$env[target];$env[reason] — expires $discordTimestamp[$get[until];RelativeTime]]
            $setGuildVar[tb_$env[target];$get[until];$env[guild]]
            $let[all;$getGuildVar[tb_all;$env[guild];]]
            $if[$get[all]!=;
                $setGuildVar[tb_all;$get[all],$env[target];$env[guild]];
                $setGuildVar[tb_all;$env[target];$env[guild]]
            ]
            $let[n;$newCase[$env[guild];hardban;$env[target];$env[mod];$env[duration];$env[reason]]]
            $modlogPost[$env[guild];$get[n];hardban;$env[target];$env[mod];$env[duration];$env[reason] — auto-unban $discordTimestamp[$get[until];RelativeTime]]
            $dmNotify[$env[target];$env[guild];hardban;$env[duration];$get[n];$env[reason]]
            $return[$get[n]]
        `
    },
    {
        name: "tempbanSweep",
        params: ["guild"],
        code: `
            $let[all;$getGuildVar[tb_all;$env[guild];]]
            $if[$get[all]==;
                $return[0]
            ]
            $arrayLoad[uids;,;$get[all]]
            $arrayLoad[keep;]
            $let[done;0]
            $arrayForEach[uids;u;
                $if[$env[u]!=;
                    $let[until;$getGuildVar[tb_$env[u];$env[guild];0]]
                    $if[$math[$get[until]-$getTimestamp]>0;
                        $arrayPush[keep;$env[u]]
                    ;
                        $try[$unban[$env[guild];$env[u];Hardban expired];]
                        $let[n;$newCase[$env[guild];unban;$env[u];$botID;;Hardban expired automatically]]
                        $try[$modlogPost[$env[guild];$get[n];unban;$env[u];$botID;;Hardban expired automatically];]
                        $setGuildVar[tb_$env[u];0;$env[guild]]
                        $letSum[done;1]
                    ]
                ]
            ]
            $setGuildVar[tb_all;$arrayJoin[keep;,];$env[guild]]
            $return[$get[done]]
        `
    }
];
