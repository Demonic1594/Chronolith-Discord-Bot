/*
 *  * Chronolith engine — scheduled bans (hardban), flat registry edition.
 *  *
 *  * Registry (all proven-safe shapes: scalars + CSV indexes + dynamic var names):
 *  *   `tb_<uid>`   → expiry ms (scalar)
 *  *   `tb_all`     → CSV of banned user ids
 *  *
 *  * $tempban[guild;mod;target;durationText;reason] → full flow, returns case id
 *  * $tempbanSweep[guild] → unbans expired entries, returns count
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
            $let[cn;$math[$getGuildVar[caseCount;$env[guild];0]+1]]
            $setGuildVar[caseCount;$get[cn];$env[guild]]
            $!jsonLoad[c;{}]
            $!jsonSet[c;t;hardban]
            $!jsonSet[c;u;"$env[target]"]
            $!jsonSet[c;m;"$env[mod]"]
            $!jsonSet[c;d;$env[duration]]
            $!jsonSet[c;r;$env[reason]]
            $!jsonSet[c;ts;$getTimestamp]
            $setGuildVar[case_$get[cn];$jsonStringify[c];$env[guild]]
            $let[prev;$getGuildVar[ulist_$env[target];$env[guild];]]
            $if[$get[prev]!=;
                $setGuildVar[ulist_$env[target];$get[prev],$get[cn];$env[guild]];
                $setGuildVar[ulist_$env[target];$get[cn];$env[guild]]
            ]
            $let[mch;$getGuildVar[cfg;$env[guild];{}]]
            $!jsonLoad[p;$get[mch]]
            $if[$env[p;modlog]!=;
                $sendMessage[$env[p;modlog];
                    $author[⏳ Timed Ban;$userAvatar[$env[target];64;png]]
                    $color[F23F24]
                    $thumbnail[$userAvatar[$env[target];128;png]]
                    $description[<@$env[target]> — $userTag[$env[target]] · **$env[duration]** · auto-unban $discordTimestamp[$get[until];RelativeTime]
> $env[reason]]
                    $addField[Moderator;<@$env[mod]>;true]
                    $addField[Target ID;$env[target];true]
                    $footer[Chronolith • Case #$get[cn]]
                    $timestamp
                ;false]
            ]
            $if[$env[p;dmnotices]!=false;
                $try[$sendDM[$env[target];
                    $author[⏳ Timed Ban;$userAvatar[$botID;64;png]]
                    $color[F23F24]
                    $description[You were banned from **$guildName[$env[guild]]** for **$env[duration]**.
> $env[reason]]
                    $addField[Case;#$get[cn];true]
                    $footer[Chronolith • Moderation]
                ];]
            ]
            $return[$get[cn]]
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
                        $let[cn;$math[$getGuildVar[caseCount;$env[guild];0]+1]]
                        $setGuildVar[caseCount;$get[cn];$env[guild]]
                        $!jsonLoad[c;{}]
                        $!jsonSet[c;t;unban]
                        $!jsonSet[c;u;"$env[u]"]
                        $!jsonSet[c;m;"$botID"]
                        $!jsonSet[c;d;]
                        $!jsonSet[c;r;Hardban expired automatically]
                        $!jsonSet[c;ts;$getTimestamp]
                        $setGuildVar[case_$get[cn];$jsonStringify[c];$env[guild]]
                        $let[prev;$getGuildVar[ulist_$env[u];$env[guild];]]
                        $if[$get[prev]!=;
                            $setGuildVar[ulist_$env[u];$get[prev],$get[cn];$env[guild]];
                            $setGuildVar[ulist_$env[u];$get[cn];$env[guild]]
                        ]
                        $let[mch;$getGuildVar[cfg;$env[guild];{}]]
                        $!jsonLoad[p;$get[mch]]
                        $if[$env[p;modlog]!=;
                            $sendMessage[$env[p;modlog];
                                $author[🕊️ Unbanned;$userAvatar[$env[u];64;png]]
                                $color[#248046]
                                $description[<@$env[u]> — hardban expired
> Automatic unban]
                                $footer[Chronolith • Case #$get[cn]]
                                $timestamp
                            ;false]
                        ]
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
