/*
 * Chronolith engine — report lifecycle (Phase 1 #15).
 *
 * Registry per guild:
 *   `reportCount`   → last report id
 *   `report_<id>`   → JSON { rep, tgt, rsn, st, ts, claimed, closedTs, closedBy, note }
 *                     st: open | claimed | resolved | dismissed
 *   `rall`          → CSV of all live report ids (newest appended)
 *
 * $reportNew[guild;reporter;target;reason] → id
 * $reportGet[guild;id]                     → report JSON (or empty)
 * $reportAll[guild]                        → CSV of live ids
 * $reportUpdate[guild;id;status;by;note]   → 1 ok / 0 missing / -1 bad transition
 * $reportArchive[guild;id]                 → 1 / 0 (deletes the record)
 */

module.exports = [
    {
        name: "reportNew",
        params: ["guild", "reporter", "target", "reason"],
        code: `
            $let[id;$math[$getGuildVar[reportCount;$env[guild];0] + 1]]
            $setGuildVar[reportCount;$get[id];$env[guild]]
            $jsonLoad[r;{}]
            $jsonSet[r;rep;"$env[reporter]"]
            $jsonSet[r;tgt;"$env[target]"]
            $jsonSet[r;rsn;$env[reason]]
            $jsonSet[r;st;open]
            $jsonSet[r;ts;$getTimestamp]
            $setGuildVar[report_$get[id];$jsonStringify[r];$env[guild]]
            $let[all;$getGuildVar[rall;$env[guild];]]
            $if[$get[all]!=;
                $setGuildVar[rall;$get[all],$get[id];$env[guild]];
                $setGuildVar[rall;$get[id];$env[guild]]
            ]
            $return[$get[id]]
        `
    },
    {
        name: "reportGet",
        params: ["guild", "id"],
        code: `
            $return[$getGuildVar[report_$env[id];$env[guild];]]
        `
    },
    {
        name: "reportAll",
        params: ["guild"],
        code: `
            $return[$getGuildVar[rall;$env[guild];]]
        `
    },
    {
        name: "reportUpdate",
        params: ["guild", "id", "status", "by", "note"],
        code: `
            $let[raw;$getGuildVar[report_$env[id];$env[guild];]]
            $if[$get[raw]==;
                $return[0]
            ]
            $jsonLoad[r;$get[raw]]
            $let[cur;$env[r;st]]
            $let[next;$env[status]]
            $let[valid;0]
            $if[$and[$get[cur]==open;$get[next]==claimed]==true;
                $let[valid;1]
            ]
            $if[$and[$or[$get[cur]==open;$get[cur]==claimed]==true;$or[$get[next]==resolved;$get[next]==dismissed]==true]==true;
                $let[valid;1]
            ]
            $if[$get[valid]==0;
                $return[-1]
            ]
            $jsonSet[r;st;$get[next]]
            $if[$get[next]==claimed;
                $jsonSet[r;claimed;"$env[by]"]
            ]
            $jsonSet[r;closedBy;"$env[by]"]
            $jsonSet[r;closedTs;$getTimestamp]
            $if[$env[note]!=;
                $jsonSet[r;note;$env[note]]
            ]
            $setGuildVar[report_$env[id];$jsonStringify[r];$env[guild]]
            $return[1]
        `
    },
    {
        name: "reportArchive",
        params: ["guild", "id"],
        code: `
            $let[raw;$getGuildVar[report_$env[id];$env[guild];]]
            $if[$get[raw]==;
                $return[0]
            ]
            $setGuildVar[report_$env[id];;$env[guild]]
            $arrayLoad[all;,;$getGuildVar[rall;$env[guild];]]
            $let[i;$arrayIndexOf[all;$env[id]]]
            $if[$get[i]!=-1;
                $arraySplice[all;$get[i];1]
                $setGuildVar[rall;$arrayJoin[all;,];$env[guild]]
            ]
            $return[1]
        `
    }
];
