/*
 * Chronolith — join gate (guildMemberAdd).
 *
 * 1. autorole: adds cfg.autorole when configured
 * 2. verification: if cfg.verify.role is set, the joiner receives it and a
 *    DM with a Verify button (CustomID verify-<guild>-<user>, works in DMs;
 *    %verify is the fallback when DMs are closed)
 * 3. account-age gate: kicks accounts younger than cfg.joingate.minAgeDays
 * 4. raid throttle: >= cfg.joingate.joins members within cfg.joingate.window
 *    seconds alerts the modlog (and triggers lockdown when action=lockdown)
 * 5. join log: styled embed to the joinleave channel (flags new accounts
 *    and missing avatars — the classic alt signals)
 */

module.exports = {
    type: "guildMemberAdd",
    code: `
        $!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]

        $if[$env[cfg;autorole]!=;
            $#memberAddRoles[$guildID;$userID;$env[cfg;autorole]]
        ]

        $if[$env[cfg;verify;role]!=;
            $#memberAddRoles[$guildID;$userID;$env[cfg;verify;role]]
            $#sendDM[$userID;
                $author[Welcome to $guildName[$guildID];$userAvatar[$botID;64;png]]
                $description[Press the button below to verify and unlock the server.]
                $color[7C3AED]
                $footer[Chronolith • Verification]
                $addActionRow
                $addButton[verify-$guildID-$userID;Verify;Success]
            ]
        ]

        $if[$env[cfg;joingate;minAgeDays]!=;
            $let[ageDays;$math[($getTimestamp-$userCreatedAt[$userID])/86400000]]
            $if[$get[ageDays]<$env[cfg;joingate;minAgeDays];
                $kick[$guildID;$userID;Join gate: account younger than $env[cfg;joingate;minAgeDays] days]
                $let[n;$newCase[gate;$guildID;$userID;$botID;;Account age $math[$get[ageDays]*24]h below minimum]]
                $modlogPost[$guildID;$get[n];gate;$userID;$botID;;Join gate kick — account too new]
            ]
        ]

        $let[now;$getTimestamp]
        $let[window;$if[$env[cfg;joingate;window]!=;$env[cfg;joingate;window];60]]
        $let[maxj;$if[$env[cfg;joingate;joins]!=;$env[cfg;joingate;joins];8]]
        $let[rawjs;$getGuildVar[joins_$guildID;$guildID;]]
$onlyIf[$get[rawjs]!=;]
$!jsonLoad[js;$get[rawjs]]
        $arrayMap[js;j;
            $if[$math[$get[now]-$env[j]]<$math[$get[window]*1000];
                $return[$env[j]]
            ]
        ;js]
        $let[cnt;$arrayLength[js]]
        $arrayPush[js;$get[now]]
        $setGuildVar[joins_$guildID;$jsonStringify[js];$guildID]
        $if[$math[$get[cnt]+1]>=$get[maxj];
            $let[ch;$modlogChannel[$guildID]]
            $if[$get[ch]!=;
                $sendMessage[$get[ch];
                    $author[Anti-raid;$userAvatar[$botID;64;png]]
                    $title[⚠ Possible raid detected]
                    $color[EF4444]
                    $description[$math[$get[cnt]+1] members joined within $get[window] seconds.]
                    $footer[Chronolith • Join throttle]
                    $timestamp
                ;false]
            ]
            $if[$env[cfg;joingate;action]==lockdown;
                $lockAll[$guildID]
            ]
        ]

        $let[lch;$logChannel[$guildID;joinleave]]
        $if[$get[lch]!=;
            $sendMessage[$get[lch];
                $author[➕ $userTag[$userID];$userAvatar[$userID;64;png]]
                $color[22C55E]
                $thumbnail[$userAvatar[$userID;256;png]]
                $description[<@$userID> — member **#$guildMemberCount[$guildID]**
-# ID: $userID]
                $addField[Account created;$discordTimestamp[$userCreatedAt[$userID];RelativeTime]$if[$math[($getTimestamp-$userCreatedAt[$userID])/86400000]<7;
⚠️ **new account**];true]
                $footer[Chronolith • Members]
            ;false]
        ]
    `
};
