/*
 * Chronolith engine — notifications (modlog embeds + target DMs).
 *
 * Visual identity: violet brand, action-colored accents, author header with
 * the bot avatar, consistent footer + timestamp everywhere.
 *
 * $modlogPost[guild;n;action;target;mod;duration;reason]
 *   Posts a case embed to the configured modlog channel (no-op if unset).
 * $actionColor[action] → accent color per action
 * $dmNotify[target;guild;action;duration;n;reason]
 *   Silently DMs the target about the action taken (never errors out).
 */

module.exports = [
    {
        name: "modlogPost",
        params: ["guild", "n", "action", "target", "mod", "duration", "reason"],
        code: `
            $let[ch;$modlogChannel[$env[guild]]]
            $if[$get[ch]!=;
                $sendMessage[$get[ch];
                    $author[Case #$env[n] — $actionEmoji[$env[action]];$userAvatar[$env[target];64;png]]
                    $color[$actionColor[$env[action]]]
                    $thumbnail[$userAvatar[$env[target];256;png]]
                    $description[**$userTag[$env[target]]**$if[$env[duration]!=; — **$env[duration]**]
> $env[reason]]
                    $addField[Moderator;<@$env[mod]>;true]
                    $addField[Member ID;-# $env[target];true]
                    $footer[Chronolith • $discordTimestamp[$getTimestamp;ShortTime]]
                ;false]
            ]
        `
    },
    {
        name: "actionColor",
        params: ["action"],
        code: `
            $if[$or[$env[action]==ban;$or[$env[action]==softban;$or[$env[action]==kick;$or[$env[action]==nuke;$env[action]==gate]]]]==true;
                $return[EF4444]
            ]
            $if[$or[$env[action]==warn;$env[action]==automod]==true;
                $return[F59C0B]
            ]
            $if[$or[$env[action]==mute;$or[$env[action]==unmute;$or[$env[action]==quarantine;$env[action]==unquarantine]]]==true;
                $return[9B59B6]
            ]
            $if[$env[action]==unban;
                $return[22C55E]
            ]
            $return[7C3AED]
        `
    },
    {
        name: "dmNotify",
        params: ["target", "guild", "action", "duration", "n", "reason"],
        code: `
            $if[$env[action]==warn;
            ]
            $if[$env[action]==mute;
            ]
            $if[$env[action]==kick;
            ]
            $if[$env[action]==ban;
            ]
            $if[$env[action]==softban;
            ]
            $if[$env[action]==quarantine;
            ]
            $#sendDM[$env[target];
                $author[$actionEmoji[$env[action]];$userAvatar[$botID;64;png]]
                $description[**$guildName[$env[guild]]**$if[$env[duration]!=; — **$env[duration]**]
> $env[reason]]
                $color[$actionColor[$env[action]]]
                $addField[Case;-# #$env[n];true]
                $footer[Chronolith • Moderation]
            ]
        `
    }
];
