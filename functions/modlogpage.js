/*
 * Chronolith engine — paginated modlog viewer (BDFD viewer design, v2).
 *
 * One shared renderer + three paged views + page-count helpers:
 *   $modlogEntries[guild;nums]      rich entries for a comma-list of case numbers
 *   $modlogPage[guild;hi]           recent window ending at case #hi (5 per page)
 *   $modlogUserPage[guild;user;page]     a user's cases, newest first
 *   $modlogActionPage[guild;type;page]   all cases of one action type
 *   $pageCount[n]                   ceil(n/5)
 *   $modlogUserPages[guild;user]        total pages for a user
 *   $modlogActionPages[guild;type]      total pages for an action type
 *
 * Entry format (per the source design): Log #N header, Action chip,
 * User/Reason rows with ID chips, Duration row on timed actions,
 * Action By, dual-format timestamp, Case ID — diamond separators between
 * entries.
 */
module.exports = [
    {
        name: "modlogEntries",
        params: ["guild", "nums"],
        code: `
            $if[$env[nums]==;
                $return[]
            ]
            $!arrayLoad[nl;,;$env[nums]]
            $!arrayLoad[out;]
            $!arrayForEach[nl;n;
                $!jsonLoad[one;$getGuildVar[case_$env[n];$env[guild];{}]]
                $!arrayPush[out;**Log #$env[n]:**
- **Action:** \`$env[one;t]\`
> **User:** <@$env[one;u]> (\`$env[one;u]\`)
> **Reason(s):** \`$if[$env[one;r]==;No reason provided;$env[one;r]]\`
$if[$env[one;d]!=;> **Duration:** \`$env[one;d]\`
]
> **Action By:** <@$env[one;m]> (\`$env[one;m]\`)
> **Timestamp:** $discordTimestamp[$env[one;ts];RelativeTime] | $discordTimestamp[$env[one;ts];FullDateShortTime]
> **Case ID:** \`$env[n]\`]
            ]
            $return[$arrayJoin[out;

**‹=====•===‹«⟨ ♦️ ⟩»›===•=====›**

]]
        `
    },
    {
        name: "modlogPage",
        params: ["guild", "hi"],
        code: `
            $let[lo;$max[$math[$env[hi]-4];1]]
            $let[ptr;$env[hi]]
            $let[nums;]
            $loop[5;
                $if[$get[ptr]<$get[lo];
                    $break
                ]
                $if[$get[ptr]<1;
                    $break
                ]
                $let[nums;$get[nums]$if[$get[nums]!=;,]$get[ptr]]
                $let[ptr;$math[$get[ptr]-1]]
            ]
            $return[$modlogEntries[$env[guild];$get[nums]]]
        `
    },
    {
        name: "modlogUserPage",
        params: ["guild", "user", "page"],
        code: `
            $if[$getGuildVar[ulist_$env[user];$env[guild];]==;
                $return[]
            ]
            $!arrayLoad[cs;,;$getGuildVar[ulist_$env[user];$env[guild];]]
            $let[len;$arrayLength[cs]]
            $let[start;$math[($env[page]-1)*5]]
            $let[rev;$get[start]]
            $let[nums;]
            $loop[5;
                $if[$get[rev]>=$get[len];
                    $break
                ]
                $let[nums;$get[nums]$if[$get[nums]!=;,]$arrayAt[cs;$math[$get[len]-1-$get[rev]]]]
                $letSum[rev;1]
            ]
            $if[$get[nums]==;
                $return[]
            ]
            $return[$modlogEntries[$env[guild];$get[nums]]]
        `
    },
    {
        name: "modlogActionPage",
        params: ["guild", "type", "page"],
        code: `
            $let[total;$getGuildVar[caseCount;$env[guild];0]]
            $let[ptr;$get[total]]
            $!arrayLoad[ms;]
            $loop[200;
                $if[$get[ptr]<1;
                    $break
                ]
                $if[$math[$get[total]-$get[ptr]]>=200;
                    $break
                ]
                $!jsonLoad[one;$getGuildVar[case_$get[ptr];$env[guild];{}]]
                $if[$env[one;t]==$env[type];
                    $!arrayPush[ms;$get[ptr]]
                ]
                $let[ptr;$math[$get[ptr]-1]]
            ]
            $let[len;$arrayLength[ms]]
            $if[$get[len]==0;
                $return[]
            ]
            $let[start;$math[($env[page]-1)*5]]
            $let[end;$min[$math[$get[start]+4];$math[$get[len]-1]]]
            $if[$get[start]>$get[end];
                $return[]
            ]
            $let[nums;]
            $let[ptr;$get[start]]
            $loop[5;
                $if[$get[ptr]>$get[end];
                    $break
                ]
                $let[nums;$get[nums]$if[$get[nums]!=;,]$arrayAt[ms;$get[ptr]]]
                $let[ptr;$math[$get[ptr]+1]]
            ]
            $return[$modlogEntries[$env[guild];$get[nums]]]
        `
    },
    {
        name: "pageCount",
        params: ["n"],
        code: `
            $return[$ceil[$divide[$max[$env[n];1];5]]]
        `
    },
    {
        name: "modlogUserPages",
        params: ["guild", "user"],
        code: `
            $!arrayLoad[t;,;$getGuildVar[ulist_$env[user];$env[guild];]]
            $return[$pageCount[$arrayLength[t]]]
        `
    },
    {
        name: "modlogActionPages",
        params: ["guild", "type"],
        code: `
            $let[total;$getGuildVar[caseCount;$env[guild];0]]
            $let[ptr;$get[total]]
            $let[cnt;0]
            $loop[200;
                $if[$get[ptr]<1;
                    $break
                ]
                $if[$math[$get[total]-$get[ptr]]>=200;
                    $break
                ]
                $!jsonLoad[one;$getGuildVar[case_$get[ptr];$env[guild];{}]]
                $if[$env[one;t]==$env[type];
                    $letSum[cnt;1]
                ]
                $let[ptr;$math[$get[ptr]-1]]
            ]
            $return[$pageCount[$get[cnt]]]
        `
    }
];
