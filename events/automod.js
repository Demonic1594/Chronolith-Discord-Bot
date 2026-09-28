/*
 * Chronolith — automod engine v2 (messageCreate, runs on every guild message).
 *
 * Order: DM → bots → mods → command-prefix messages are skipped, then:
 *   1. invite links     (cfg.automod.invites == "true")
 *   2. banned words     (cfg.automod.words CSV, substring, case-insensitive)
 *   3. link filter      (cfg.automod.links == "true": any link is blocked
 *                        unless its domain is in cfg.automod.linkwl CSV)
 *   4. mention spam     (cfg.automod.mentionLimit = max <@ occurrences)
 *   5. all-caps spam    (cfg.automod.caps == "true", whole message uppercase,
 *                        min length cfg.automod.capsMin)
 *   6. flood spam       (cfg.automod.spam == "true": >= cfg.automod.spamN
 *                        messages within cfg.automod.spamS seconds →
 *                        auto-mute 10m + case)
 *
 * A violation deletes the message, records an "automod" case, posts the
 * modlog embed and leaves a 5-second notice in the channel.
 */

module.exports = {
    type: "messageCreate",
    code: `
        $onlyIf[$guildID!=;]
        $onlyIf[$isBot[$authorID]!=true;]
        $onlyIf[$isMod[$guildID;$authorID]!=true;]
        $let[content;$#messageContent[$channelID;$messageID]]
        $onlyIf[$get[content]!=;]
        $let[firstword;$advancedTextSplit[$get[content]; ;0]]
        $arrayLoad[cmds;,;warn,warnings,delwarn,clearwarns,mute,unmute,timeout,kick,ban,softban,unban,tempban,massban,setnick,quarantine,unquarantine,role,purge,clear,slowmode,lock,unlock,lockdown,unlockdown,case,cases,history,reason,modlog,automod,wordadd,worddel,words,linkwl,joingate,antinuke,verify,config,quicksetup,modrole,muterole,warnset,autorole,logs,tickets,help,ping,userinfo,whois,serverinfo,guildinfo,roleinfo,avatar,pfp,banner,inrole,stats,about,snipe,editsnipe,report,ticket,eval]
        $let[invokes;$or[$startsWith[$get[firstword];c!];$or[$startsWith[$get[firstword];c?];$startsWith[$get[firstword];%]]]
        $if[$get[invokes]==true;
            $let[cmd;$advancedTextSplit[$advancedTextSplit[$advancedTextSplit[$get[firstword];c!;1];c?;1];%;1]]]
            $onlyIf[$arrayIncludes[cmds;$get[cmd]]!=true;]
        ]

        $!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
        $let[low;$toLowerCase[$get[content]]]
        $let[vio;]

        $if[$env[cfg;automod;invites]==true;
            $if[$or[$checkContains[$get[low];discord.gg/];$or[$checkContains[$get[low];discord.com/invite];$checkContains[$get[low];dsc.gg]]]==true;
                $let[vio;Invite links]
            ]
        ]

        $if[$get[vio]==;
            $if[$env[cfg;automod;words]!=;
                $arrayLoad[words;,;$env[cfg;automod;words]]
                $if[$arraySome[words;w;$checkCondition[$checkContains[$get[low];$env[w]]]]==true;
                    $let[vio;Banned word]
                ]
            ]
        ]

        $if[$get[vio]==;
            $if[$env[cfg;automod;links]==true;
                $if[$checkContains[$get[low];http]==true;
                    $arrayLoad[wlc;,;$env[cfg;automod;linkwl]]
                    $let[allowed;0]
                    $arrayForEach[wlc;d;
                        $if[$checkContains[$get[low];//$env[d]]==true;
                            $letSum[allowed;1]
                        ]
                    ]
                    $if[$get[allowed]==0;
                        $let[vio;Unwhitelisted link]
                    ]
                ]
            ]
        ]

        $if[$get[vio]==;
            $if[$env[cfg;automod;mentionLimit]!=;
                $arrayLoad[m;<@;$get[content]]
                $if[$math[$arrayLength[m]-1]>=$env[cfg;automod;mentionLimit];
                    $let[vio;Mention spam]
                ]
            ]
        ]

        $if[$get[vio]==;
            $if[$env[cfg;automod;caps]==true;
                $if[$env[cfg;automod;capsMin]!=;
                    $if[$get[content]==$toUpperCase[$get[content]];
                        $if[$charCount[$get[content]]>=$env[cfg;automod;capsMin];
                            $let[vio;Excessive caps]
                        ]
                    ]
                ]
            ]
        ]

        $if[$get[vio]==;
            $if[$env[cfg;automod;spam]==true;
                $let[limit;$if[$env[cfg;automod;spamN]!=;$env[cfg;automod;spamN];5]]
                $let[secs;$if[$env[cfg;automod;spamS]!=;$env[cfg;automod;spamS];5]]
                $let[now;$getTimestamp]
                $arrayLoad[rl;,;$getGuildVar[rl_$authorID;$guildID;]]
                $arrayMap[rl;t;
                    $if[$math[$get[now]-$env[t]]<$math[$get[secs]*1000];
                        $return[$env[t]]
                    ]
                ;rl]
                $arrayPush[rl;$get[now]]
                $setGuildVar[rl_$authorID;$arrayJoin[rl;,];$guildID]
                $if[$arrayLength[rl]>=$get[limit];
                    $setGuildVar[rl_$authorID;;$guildID]
                    $#deleteMessage[$channelID;$messageID]
                    $punish[mute;$guildID;$botID;$authorID;10m;Automod: message flooding ($arrayLength[rl] msgs/$get[secs]s)]
                    $sendMessage[$channelID;
                        $author[Automod;$userAvatar[$botID;64;png]]
                        $description[<@$authorID> muted 10m — **message flooding**.]
                        $color[F59E0B]
                        $footer[Chronolith • Automod]
                    ;false]
                    $deleteIn[8s]
                    $stop
                ]
            ]
        ]

        $if[$get[vio]!=;
            $#deleteMessage[$channelID;$messageID]
            $let[n;$newCase[$guildID;automod;$authorID;$botID;;Automod trigger: $get[vio]]]
            $modlogPost[$guildID;$get[n];automod;$authorID;$botID;;Automod trigger: $get[vio] (message deleted)]
            $sendMessage[$channelID;
                $author[Automod;$userAvatar[$botID;64;png]]
                $description[<@$authorID> message removed — **$get[vio]**.]
                $color[F59E0B]
                $footer[Chronolith • Automod]
            ;false]
            $deleteIn[5s]
        ]
    `
};
