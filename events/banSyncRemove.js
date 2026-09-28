/*
 * Chronolith — manual unban detection (guildBanRemove).
 * Records non-Chronolith unbans as cases with the audit-log executor.
 */

module.exports = {
    type: "guildBanRemove",
    code: `
        $let[executor;$fetchAuditLog[$guildID;MemberBanRemove;executorID;0]]
        $if[$get[executor]!=$botID;
            $let[target;$fetchAuditLog[$guildID;MemberBanRemove;targetID;0]]
            $let[reason;$fetchAuditLog[$guildID;MemberBanRemove;reason;0]]
            $if[$get[reason]==;
                $let[reason;No reason provided (manual unban)]
            ]
            $let[n;$newCase[$guildID;unban;$get[target];$get[executor];;$get[reason]]]
            $modlogPost[$guildID;$get[n];unban;$get[target];$get[executor];;$get[reason]]
        ]
    `
};
