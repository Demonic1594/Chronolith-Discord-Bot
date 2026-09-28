/*
 * Chronolith engine — the case system.
 *
 * Every moderation action becomes a numbered case:
 *   guild var `caseCount`   → last case number (default 0)
 *   guild var `case_<n>`    → JSON { t: type, u: target, m: mod, d: duration, r: reason, ts: ms }
 *   guild var `ulist_<uid>` → CSV of case numbers involving that user
 *
 * $newCase[guild;type;target;mod;duration;reason] → returns the case number
 * $caseGet[guild;n]                    → returns the case JSON string (or empty)
 * $caseEditReason[guild;n;newReason]   → updates the reason (returns ok/error)
 * $userCases[guild;user]               → returns CSV of that user's case numbers
 */

module.exports = [
    {
        name: "newCase",
        params: ["guild", "type", "target", "mod", "duration", "reason"],
        code: `
            $let[n;$math[$getGuildVar[caseCount;$env[guild];0] + 1]]
            $setGuildVar[caseCount;$get[n];$env[guild]]
            $jsonLoad[c;{}]
            $jsonSet[c;t;$env[type]]
            $jsonSet[c;u;$env[target]]
            $jsonSet[c;m;$env[mod]]
            $jsonSet[c;d;$env[duration]]
            $jsonSet[c;r;$env[reason]]
            $jsonSet[c;ts;$getTimestamp]
            $setGuildVar[case_$get[n];$jsonStringify[c];$env[guild]]
            $let[msraw;$getGuildVar[mstats;$env[guild];{}]]
            $jsonLoad[ms;$get[msraw]]
            $jsonSet[ms;$env[mod];$env[type];$math[$default[$env[ms;$env[mod];$env[type]];0] + 1]]
            $setGuildVar[mstats;$jsonStringify[ms];$env[guild]]
            $let[prev;$getGuildVar[ulist_$env[target];$env[guild];]]
            $if[$get[prev]!=;
                $setGuildVar[ulist_$env[target];$get[prev],$get[n];$env[guild]];
                $setGuildVar[ulist_$env[target];$get[n];$env[guild]]
            ]
            $return[$get[n]]
        `
    },
    {
        name: "caseGet",
        params: ["guild", "n"],
        code: `
            $return[$getGuildVar[case_$env[n];$env[guild];]]
        `
    },
    {
        name: "caseEditReason",
        params: ["guild", "n", "reason"],
        code: `
            $let[raw;$getGuildVar[case_$env[n];$env[guild];]]
            $if[$get[raw]==;
                $return[error]
            ]
            $jsonLoad[c;$get[raw]]
            $jsonSet[c;r;$env[reason]]
            $setGuildVar[case_$env[n];$jsonStringify[c];$env[guild]]
            $return[ok]
        `
    },
    {
        // Hard-removes a case: deletes the record and its user-index entry.
        name: "caseRemove",
        params: ["guild", "n"],
        code: `
            $let[raw;$getGuildVar[case_$env[n];$env[guild];]]
            $if[$get[raw]==;
                $return[0]
            ]
            $jsonLoad[c;$get[raw]]
            $setGuildVar[case_$env[n];;$env[guild]]
            $let[uid;$env[c;u]]
            $arrayLoad[cs;,;$getGuildVar[ulist_$get[uid];$env[guild];]]
            $let[i;$arrayIndexOf[cs;$env[n]]]
            $if[$get[i]!=-1;
                $arraySplice[cs;$get[i];1]
                $setGuildVar[ulist_$get[uid];$arrayJoin[cs;,];$env[guild]]
            ]
            $return[1]
        `
    },
    {
        // Removes every warn-type case of a user. Returns removed count.
        name: "warnsRemove",
        params: ["guild", "user"],
        code: `
            $arrayLoad[cs;,;$getGuildVar[ulist_$env[user];$env[guild];]]
            $let[rm;0]
            $arrayForEach[cs;k;
                $jsonLoad[one;$getGuildVar[case_$env[k];$env[guild];{}]]
                $if[$env[one;t]==warn;
                    $setGuildVar[case_$env[k];;$env[guild]]
                    $letSum[rm;1]
                ]
            ]
            $setGuildVar[ulist_$env[user];;$env[guild]]
            $return[$get[rm]]
        `
    },
    {
        name: "userCases",
        params: ["guild", "user"],
        code: `
            $return[$getGuildVar[ulist_$env[user];$env[guild];]]
        `
    }
,
    {
        // JSON {warn:n, kick:n, ...} of a moderator's action counts.
        name: "modStats",
        params: ["guild", "user"],
        code: `
            $jsonLoad[ms;$getGuildVar[mstats;$env[guild];{}]]
            $return[$jsonStringify[$env[ms;$env[user]]]]
        `
    }
];