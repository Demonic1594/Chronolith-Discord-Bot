/*
 * Chronolith engine — the punishment pipeline.
 *
 * $punish[action;guild;mod;target;duration;reason]
 *   actions: warn | mute | unmute | kick | ban | softban | unban | note |
 *            quarantine | unquarantine
 *   - validates (self/bot/owner targets, role hierarchy, bot capability)
 *   - applies the Discord-side action (mute prefers configured muterole,
 *     falls back to native timeout; quarantine applies the configured
 *     quarantine role plus a 28d timeout)
 *   - records a numbered case, posts the modlog embed, DMs the target
 *   - warn escalation: at the configured threshold the configured action
 *     fires automatically (one level deep)
 *   returns a single-line result (⛔-prefixed on rejection)
 *
 * See notify.js for $modlogPost / $dmNotify.
 */

module.exports = [
    {
        // Validation → "ok" or a plain rejection message.
        name: "punishCheck",
        params: ["guild", "mod", "target", "action"],
        code: `
            $if[$env[target]==$env[mod];
                $return[you cannot moderate yourself]
            ]
            $if[$env[target]==$botID;
                $return[you cannot moderate me]
            ]
            $if[$env[target]==$botOwnerID;
                $return[you cannot moderate my owner]
            ]
            $if[$env[target]==$guildOwnerID;
                $return[the server owner cannot be moderated]
            ]
            $if[$or[$env[action]==kick;$or[$env[action]==ban;$or[$env[action]==softban;$env[action]==tempban]]]==true;
                $if[$and[$hasPerms[$env[guild];$botID;Administrator]!=true;$hasPerms[$env[guild];$botID;KickMembers]!=true]==true;
                    $return[I am missing the Kick Members permission]
                ]
            ]
            $if[$or[$env[action]==ban;$or[$env[action]==softban;$env[action]==tempban]]==true;
                $if[$and[$hasPerms[$env[guild];$botID;Administrator]!=true;$hasPerms[$env[guild];$botID;BanMembers]!=true]==true;
                    $return[I am missing the Ban Members permission]
                ]
            ]
            $if[$or[$env[action]==mute;$or[$env[action]==unmute;$or[$env[action]==quarantine;$env[action]==unquarantine]]]==true;
                $if[$and[$hasPerms[$env[guild];$botID;Administrator]!=true;$hasPerms[$env[guild];$botID;ModerateMembers]!=true]==true;
                    $return[I am missing the Timeout Members permission]
                ]
            ]
            $if[$or[$env[action]==unban;$env[action]==note]==true;
                $return[ok]
            ]
            $jsonLoad[pcfg;$getGuildVar[cfg;$env[guild];{}]]
            $if[$env[pcfg;protected;users]!=;
                $arrayLoad[pus;,;$env[pcfg;protected;users]]
                $if[$arraySome[pus;p;$checkCondition[$env[p]==$env[target]]]==true;
                    $return[that user is protected in this server]
                ]
            ]
            $if[$env[pcfg;protected;roles]!=;
                $arrayLoad[prs;,;$env[pcfg;protected;roles]]
                $arrayLoad[trs;,;$memberRoles[$env[guild];$env[target];,]]
                $arrayForEach[prs;r;
                    $if[$arraySome[trs;pr;$checkCondition[$env[pr]==$env[r]]]==true;
                        $return[that member holds a protected role]
                    ]
                ]
            ]
            $if[$memberExists[$env[guild];$env[target]]!=true;
                $if[$env[action]==ban;
                    $return[ok]
                ]
                $return[that user is not in this server]
            ]
            $if[$env[mod]!=$guildOwnerID;
                $let[mpos;$rolePosition[$env[guild];$default[$memberHighestRoleID[$env[guild];$env[mod]];$env[guild]]]]
                $let[tpos;$rolePosition[$env[guild];$default[$memberHighestRoleID[$env[guild];$env[target]];$env[guild]]]]
                $if[$get[mpos]<=$get[tpos];
                    $return[that member is at or above your position]
                ]
            ]
            $if[$or[$env[action]==ban;$or[$env[action]==softban;$or[$env[action]==hardban;$env[action]==nuke]]]==true;
                $if[$isBannable[$env[guild];$env[target]]!=true;
                    $return[I lack permission to ban that member (role hierarchy)]
                ]
            ]
            $if[$or[$env[action]==kick;$or[$env[action]==mute;$or[$env[action]==quarantine;$env[action]==unquarantine]]]==true;
                $if[$isKickable[$env[guild];$env[target]]!=true;
                    $return[I lack permission to moderate that member (role hierarchy)]
                ]
            ]
            $return[ok]
        `
    },
    {
        // Number of warn-type cases on record for a user.
        name: "warnCount",
        params: ["guild", "user"],
        code: `
            $arrayLoad[cs;,;$getGuildVar[ulist_$env[user];$env[guild];]]
            $let[w;0]
            $arrayForEach[cs;k;
                $jsonLoad[one;$getGuildVar[case_$env[k];$env[guild];{}]]
                $if[$env[one;t]==warn;
                    $letSum[w;1]
                ]
            ]
            $return[$get[w]]
        `
    },
    {
        name: "punish",
        params: ["action", "guild", "mod", "target", "duration", "reason"],
        code: `
            $let[chk;$punishCheck[$env[guild];$env[mod];$env[target];$env[action]]]
            $if[$get[chk]!=ok;
                $return[⛔ $get[chk].]
            ]
            $let[reason2;$if[$env[reason]==;No reason provided;$env[reason]]]
            $jsonLoad[cfg;$getGuildVar[cfg;$env[guild];{}]]

            $switch[$env[action];
                $case[warn;
                    $let[n;$newCase[$env[guild];warn;$env[target];$env[mod];;$get[reason2]]]
                    $let[count;$warnCount[$env[guild];$env[target]]]
                ]
                $case[mute;
                    $let[dur2ms;$durationToMs[$env[duration]]]
                    $let[dur2;$if[$math[$get[dur2ms]>2592000000]==true;2592000000;$env[duration]]]
                    $jsonLoad[td;$getGuildVar[timedouts;$env[guild];{}]]
                    $jsonSet[td;$env[target];$math[$getTimestamp+$get[dur2ms]]]
                    $setGuildVar[timedouts;$jsonStringify[td];$env[guild]]
                    $if[$env[cfg;muterole]!=;
                        $memberAddRoles[$env[guild];$env[target];$env[cfg;muterole]];
                        $timeout[$env[guild];$env[target];$get[dur2];$get[reason2]]
                    ]
                    $let[n;$newCase[$env[guild];mute;$env[target];$env[mod];$env[duration];$get[reason2]]]
                ]
                $case[unmute;
                    $jsonLoad[td2;$getGuildVar[timedouts;$env[guild];{}]]
                    $jsonDelete[td2;$env[target]]
                    $setGuildVar[timedouts;$jsonStringify[td2];$env[guild]]
                    $if[$env[cfg;muterole]!=;
                        $memberRemoveRoles[$env[guild];$env[target];$env[cfg;muterole]]
                    ]
                    $timeout[$env[guild];$env[target];;$get[reason2]]
                    $let[n;$newCase[$env[guild];unmute;$env[target];$env[mod];;$get[reason2]]]
                ]
                $case[kick;
                    $kick[$env[guild];$env[target];$get[reason2]]
                    $let[n;$newCase[$env[guild];kick;$env[target];$env[mod];;$get[reason2]]]
                ]
                $case[ban;
                    $ban[$env[guild];$env[target];$get[reason2]]
                    $let[n;$newCase[$env[guild];ban;$env[target];$env[mod];;$get[reason2]]]
                ]
                $case[hardban;
                    $ban[$env[guild];$env[target];$get[reason2] — expires $discordTimestamp[$math[$getTimestamp+$durationToMs[$env[duration]]];RelativeTime]]
                    $setGuildVar[tb_$env[target];$math[$getTimestamp+$durationToMs[$env[duration]]];$env[guild]]
                    $let[tball;$getGuildVar[tb_all;$env[guild];]]
                    $if[$get[tball]!=;
                        $setGuildVar[tb_all;$get[tball],$env[target];$env[guild]];
                        $setGuildVar[tb_all;$env[target];$env[guild]]
                    ]
                    $let[n;$newCase[$env[guild];hardban;$env[target];$env[mod];$env[duration];$get[reason2]]]
                ]
                $case[softban;
                    $ban[$env[guild];$env[target];$get[reason2];86400]
                    $unban[$env[guild];$env[target];Softban cleanup]
                    $let[n;$newCase[$env[guild];softban;$env[target];$env[mod];;$get[reason2]]]
                ]
                $case[unban;
                    $#unban[$env[guild];$env[target];$get[reason2]]
                    $setGuildVar[tb_$env[target];0;$env[guild]]
                    $let[tball;$getGuildVar[tb_all;$env[guild];]]
                    $if[$get[tball]!=;
                        $arrayLoad[tbids;,;$get[tball]]
                        $arrayMap[tbids;u;
                            $if[$and[$env[u]!=$env[target];$math[$getGuildVar[tb_$env[u];$env[guild];0]-$getTimestamp]>0]==true;
                                $return[$env[u]]
                            ]
                        ;tbids]
                        $setGuildVar[tb_all;$arrayJoin[tbids;,];$env[guild]]
                    ]
                    $let[n;$newCase[$env[guild];unban;$env[target];$env[mod];;$get[reason2]]]
                ]
                $case[note;
                    $let[n;$newCase[$env[guild];note;$env[target];$env[mod];;$get[reason2]]]
                ]
                $case[quarantine;
                    $if[$env[cfg;qrole]!=;
                        $memberAddRoles[$env[guild];$env[target];$env[cfg;qrole]]
                    ]
                    $timeout[$env[guild];$env[target];2592000000;$get[reason2] (quarantine)]
                    $let[n;$newCase[$env[guild];quarantine;$env[target];$env[mod];;$get[reason2]]]
                ]
                $case[unquarantine;
                    $if[$env[cfg;qrole]!=;
                        $memberRemoveRoles[$env[guild];$env[target];$env[cfg;qrole]]
                    ]
                    $timeout[$env[guild];$env[target];;$get[reason2]]
                    $let[n;$newCase[$env[guild];unquarantine;$env[target];$env[mod];;$get[reason2]]]
                ]
            ]

            $modlogPost[$env[guild];$get[n];$env[action];$env[target];$env[mod];$env[duration];$get[reason2]]
            $if[$and[$env[cfg;dmnotices]!=false;$env[action]!=unban]==true;
                $dmNotify[$env[target];$env[guild];$env[action];$env[duration];$get[n];$get[reason2]]
            ]

            $if[$env[action]==warn;
                $if[$or[$env[cfg;warns;action]==mute;$or[$env[cfg;warns;action]==kick;$env[cfg;warns;action]==ban]]==true;
                    $if[$env[cfg;warns;threshold]!=;
                        $if[$get[count]>=$env[cfg;warns;threshold];
                            $punish[$env[cfg;warns;action];$env[guild];$env[mod];$env[target];$env[cfg;warns;duration];Automatic escalation: $get[count] warnings on record]
                        ]
                    ]
                ]
            ]

            $return[✅ Done — case #$get[n]]
        `
    },
    {
        // Multi-target driver: $punishMulti[action;guild;mod;targetsCSV;duration;reason]
        // Runs punish per target; returns JSON {ok, fail}.
        name: "punishMulti",
        params: ["action", "guild", "mod", "targets", "duration", "reason"],
        code: `
            $arrayLoad[tg;,;$env[targets]]
            $let[ok;0]
            $let[fail;0]
            $arrayForEach[tg;u;
                $if[$env[u]!=;
                    $let[r;$punish[$env[action];$env[guild];$env[mod];$env[u];$env[duration];$env[reason]]]
                    $if[$checkContains[$get[r];⛔]==true;
                        $letSum[fail;1]
                    ;
                        $letSum[ok;1]
                    ]
                ]
            ]
            $jsonLoad[sm;{}]
            $jsonSet[sm;ok;$get[ok]]
            $jsonSet[sm;fail;$get[fail]]
            $return[$jsonStringify[sm]]
        `
    }
];
