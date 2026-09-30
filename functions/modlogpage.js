/*
 * Chronolith engine — paginated modlog page renderer (BDFD viewer design).
 *
 * $modlogPage[guild;hi] → the 5-entry page body ending at case #<hi>
 * (descending), entries in the source design: Log #N header, Action chip,
 * User/Reason/Action-By rows with ID chips, dual-format timestamp, Case ID,
 * diamond separators between entries.
 * $modlogEmpty[guild] → true when there are no cases at all.
 */
module.exports = [
    {
        name: "modlogPage",
        params: ["guild", "hi"],
        code: `
            $let[lo;$max[$math[$env[hi]-4];1]]
            $let[ptr;$env[hi]]
            $arrayLoad[out;]
            $loop[5;
                $if[$get[ptr]<$get[lo];
                    $break
                ]
                $if[$get[ptr]<1;
                    $break
                ]
                $!jsonLoad[one;$getGuildVar[case_$get[ptr];$env[guild];{}]]
                $!arrayPush[out;**Log #$get[ptr]:**
- **Action:** \`$env[one;t]\`
> **User:** <@$env[one;u]> (\`$env[one;u]\`)
> **Reason(s):** \`$if[$env[one;r]==;No reason provided;$env[one;r]]\`
> **Action By:** <@$env[one;m]> (\`$env[one;m]\`)
> **Timestamp:** $discordTimestamp[$env[one;ts];RelativeTime] | $discordTimestamp[$env[one;ts];FullDateShortTime]
> **Case ID:** \`$get[ptr]\`]
                $let[ptr;$math[$get[ptr]-1]]
            ]
            $return[$arrayJoin[out;

**‹=====•===‹«⟨ ♦️ ⟩»›===•=====›**

]]
        `
    },
    {
        name: "modlogEmpty",
        params: ["guild"],
        code: `
            $if[$getGuildVar[caseCount;$env[guild];0]==0;
                $return[> \`No Mod logs as of yet.\`]
            ]
            $return[]
        `
    }
];
