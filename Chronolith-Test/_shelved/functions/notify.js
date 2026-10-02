/*
 * Chronolith engine — notifications (modlog embeds + target DMs). v2 design.
 *
 * Design language: "dark crystal" — avatar-anchored headers, blockquoted
 * reasons as the primary content, inline metadata fields, no clutter.
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
                    $author[$actionEmoji[$env[action]];$userAvatar[$env[target];64;png]]
                    $color[$actionColor[$env[action]]]
                    $thumbnail[$userAvatar[$env[target];128;png]]
                    $description[<@$env[target]> — $userTag[$env[target]]$if[$env[duration]!=; · **$env[duration]**]
> $env[reason]]
                    $addField[Moderator;<@$env[mod]>;true]
                    $addField[Target ID;$env[target];true]
                    $footer[Chronolith • Case #$env[n]]
                    $timestamp
                ;false]
            ]
        `
    },
    {
        name: "dmNotify",
        params: ["target", "guild", "action", "duration", "n", "reason"],
        code: `
            $try[$sendDM[$env[target];
                $author[$actionEmoji[$env[action]];$userAvatar[$botID;64;png]]
                $color[$actionColor[$env[action]]]
                $description[You received a moderation action in **$guildName[$env[guild]]**$if[$env[duration]!=;
Duration: **$env[duration]**].

> $env[reason]]
                $addField[Case;#$env[n];true]
                $addField[Server;$guildName[$env[guild]];true]
                $footer[Chronolith • Moderation]
            ];]
        `
    }
];
