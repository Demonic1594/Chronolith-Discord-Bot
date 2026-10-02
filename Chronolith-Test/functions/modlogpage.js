/*
 * Chronolith engine — paginated modlog viewer, v3.1.
 *
 * Pages are ASCENDING reading order: page 1 holds cases 1-5, page 2 holds
 * 6-10, ... the newest cases live on the LAST page (recent = last page).
 * Entries inside a page are listed oldest → newest.
 * Action pages are the opposite on purpose: newest first (last 200 cases only).
 *
 *   $modlogEntries[guild;nums]        rich entries for a comma-list of case numbers
 *   $modlogPage[guild;page]           ascending page of the full log (5 per page)
 *   $modlogUserPage[guild;user;page]  a user's cases, ascending (5 per page)
 *   $modlogUserFilter[guild;user;type] CSV of a user's cases of one action type
 *   $modlogActionPage[guild;type;page] all cases of one action type (5 per page)
 *   $modlogActions[guild]             distinct action types present (newest first, CSV)
 *   $pageCount[n]                     ceil(n/5), never below 1
 *   $modlogUserPages[guild;user]      total pages for a user
 *   $modlogActionPages[guild;type]    total pages for an action type
 *
 * v3.1 changes (same names, same signatures, same output shapes):
 *   - empty arrays are created with the bare form ($arrayLoad[name]) — the documented way to get a
 *     truly empty array; $arrayLoad[name;] risks a [""] phantom element that would shorten page 1
 *   - page arguments are clamped to >= 1 (a stray page 0 / -1 used to read case numbers <= 0)
 *   - $modlogActions and $modlogEntries skip empty / missing action types and case numbers
 *   - $modlogActionPages counts with an array instead of $letSum (one fewer moving part)
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
            $!arrayLoad[out]
            $!arrayForEach[nl;n;
                $if[$env[n]!=;
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
            ]
            $return[$arrayJoin[out;

**‹=====•===‹«⟨ ♦️ ⟩»›===•=====›**

]]
        `
    },
    {
        name: "modlogPage",
        params: ["guild", "page"],
        code: `
            $let[total;$getGuildVar[caseCount;$env[guild];0]]
            $let[pg;$max[$env[page];1]]
            $let[lo;$math[($get[pg]-1)*5+1]]
            $let[hi;$min[$math[$get[pg]*5];$get[total]]]
            $if[$get[lo]>$get[hi];
                $return[]
            ]
            $let[nums;]
            $let[ptr;$get[lo]]
            $loop[5;
                $if[$get[ptr]>$get[hi];
                    $break
                ]
                $let[nums;$get[nums]$if[$get[nums]!=;,]$get[ptr]]
                $let[ptr;$math[$get[ptr]+1]]
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
            $let[pg;$max[$env[page];1]]
            $let[start;$math[($get[pg]-1)*5]]
            $if[$get[start]>=$get[len];
                $return[]
            ]
            $let[nums;]
            $let[ptr;$get[start]]
            $loop[5;
                $if[$get[ptr]>=$get[len];
                    $break
                ]
                $let[nums;$get[nums]$if[$get[nums]!=;,]$arrayAt[cs;$get[ptr]]]
                $let[ptr;$math[$get[ptr]+1]]
            ]
            $return[$modlogEntries[$env[guild];$get[nums]]]
        `
    },
    {
        name: "modlogUserFilter",
        params: ["guild", "user", "type"],
        code: `
            $if[$getGuildVar[ulist_$env[user];$env[guild];]==;
                $return[]
            ]
            $!arrayLoad[cs;,;$getGuildVar[ulist_$env[user];$env[guild];]]
            $!arrayLoad[out]
            $!arrayForEach[cs;k;
                $if[$env[k]!=;
                    $!jsonLoad[one;$getGuildVar[case_$env[k];$env[guild];{}]]
                    $if[$env[one;t]==$env[type];
                        $!arrayPush[out;$env[k]]
                    ]
                ]
            ]
            $return[$arrayJoin[out;,]]
        `
    },
    {
        name: "modlogActionPage",
        params: ["guild", "type", "page"],
        code: `
            $let[total;$getGuildVar[caseCount;$env[guild];0]]
            $let[ptr;$get[total]]
            $!arrayLoad[ms]
            $loop[200;
                $if[$get[ptr]<1;
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
            $let[pg;$max[$env[page];1]]
            $let[start;$math[($get[pg]-1)*5]]
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
        name: "modlogActions",
        params: ["guild"],
        code: `
            $let[total;$getGuildVar[caseCount;$env[guild];0]]
            $let[ptr;$get[total]]
            $!arrayLoad[seen]
            $!arrayLoad[out]
            $loop[200;
                $if[$get[ptr]<1;
                    $break
                ]
                $!jsonLoad[one;$getGuildVar[case_$get[ptr];$env[guild];{}]]
                $if[$env[one;t]!=;
                    $if[$checkContains[,$arrayJoin[seen;,],;,$env[one;t],]!=true;
                        $!arrayPush[seen;$env[one;t]]
                        $!arrayPush[out;$env[one;t]]
                    ]
                ]
                $let[ptr;$math[$get[ptr]-1]]
            ]
            $return[$arrayJoin[out;,]]
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
            $if[$getGuildVar[ulist_$env[user];$env[guild];]==;
                $return[1]
            ]
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
            $!arrayLoad[hits]
            $loop[200;
                $if[$get[ptr]<1;
                    $break
                ]
                $!jsonLoad[one;$getGuildVar[case_$get[ptr];$env[guild];{}]]
                $if[$env[one;t]==$env[type];
                    $!arrayPush[hits;$get[ptr]]
                ]
                $let[ptr;$math[$get[ptr]-1]]
            ]
            $return[$pageCount[$arrayLength[hits]]]
        `
    }
];
