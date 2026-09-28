/*
 * Chronolith engine — anti-nuke (Wick-style destructive-action defense).
 *
 * events/auditWatch.js feeds every dangerous audit action here:
 *   $anCheck[guild;action;targetID]
 *
 * Behavior:
 *   - mods (isMod = ManageServer / modrole / owner) are whitelisted
 *   - the bot's own actions are ignored
 *   - every dangerous action by a non-mod is counted (per executor, 20s window)
 *   - passing the threshold (cfg.antinuke.threshold, default 3) triggers the
 *     configured response: strip (remove all roles), kick, or ban
 *   - every hit alerts the modlog channel
 *
 * Config (cfg.antinuke): { on: "true"/"false", threshold: 3, action: "ban" }
 */

module.exports = [
    {
        name: "anCheck",
        params: ["guild", "action", "targetID"],
        code: `
            $let[executor;$auditLog[executorID]]
            $if[$get[executor]==;
                $return[skip]
            ]
            $if[$get[executor]==$botID;
                $return[skip]
            ]
            $if[$isMod[$env[guild];$get[executor]]==true;
                $return[skip]
            ]
            $jsonLoad[cfg;$getGuildVar[cfg;$env[guild];{}]]
            $if[$env[cfg;antinuke;on]!=true;
                $return[off]
            ]

            $let[n;$newCase[$env[guild];nuke;$get[executor];$get[executor];;$env[action] by non-whitelisted moderator]]
            $let[ch;$modlogChannel[$env[guild]]]
            $if[$get[ch]!=;
                $sendMessage[$get[ch];
                    $author[Anti-nuke;$userAvatar[$botID;64;png]]
                    $title[⚠ Destructive action detected]
                    $color[EF4444]
                    $description[<@$get[executor]> performed **$env[action]** (target: $env[targetID])]
                    $footer[Chronolith • Case #$get[n]]
                    $timestamp
                ;false]
            ]

            $let[now;$getTimestamp]
            $arrayLoad[hit;,;$getGuildVar[anc_$get[executor];$env[guild];]]
            $arrayMap[hit;h;
                $if[$math[$get[now]-$env[h]]<20000;
                    $return[$env[h]]
                ]
            ;hit]
            $arrayPush[hit;$get[now]]
            $setGuildVar[anc_$get[executor];$arrayJoin[hit;,];$env[guild]]

            $let[limit;$if[$env[cfg;antinuke;threshold]!=;$env[cfg;antinuke;threshold];3]]
            $if[$arrayLength[hit]<$get[limit];
                $return[watching]
            ]

            $let[resp;$if[$env[cfg;antinuke;action]!=;$env[cfg;antinuke;action];ban]]
            $setGuildVar[anc_$get[executor];;$env[guild]]
            $let[n2;$newCase[$env[guild];nuke;$get[executor];$botID;;Auto-response: $get[resp] after $arrayLength[hit] dangerous actions]]
            $modlogPost[$env[guild];$get[n2];$get[resp];$get[executor];$botID;;Anti-nuke: $arrayLength[hit] dangerous actions within 20s]

            $if[$get[resp]==ban;
                $ban[$env[guild];$get[executor];Anti-nuke: mass destructive actions]
            ]
            $if[$get[resp]==kick;
                $kick[$env[guild];$get[executor];Anti-nuke: mass destructive actions]
            ]
            $if[$get[resp]==strip;
                $arrayLoad[allroles;,;$memberRoles[$env[guild];$get[executor];,]]
                $arrayForEach[allroles;r;
                    $#memberRemoveRoles[$env[guild];$get[executor];$env[r]]
                ]
            ]
            $dmNotify[$get[executor];$env[guild];$get[resp];;$get[n2];Anti-nuke protection triggered]
            $return[acted]
        `
    }
];
