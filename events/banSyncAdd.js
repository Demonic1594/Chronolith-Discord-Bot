/*
 * Chronolith — manual ban detection (guildBanAdd).
 * If the newest MemberBanAdd audit entry was NOT executed by Chronolith,
 * record it as a case with the real moderator and reason from the audit log.
 * (Bans issued through Chronolith already created their case and are skipped.)
 */

module.exports = {
    type: "guildBanAdd",
    code: `
        $let[executor;$fetchAuditLog[$guildID;MemberBanAdd;executorID;0]]
        $if[$get[executor]!=$botID;
            $let[target;$fetchAuditLog[$guildID;MemberBanAdd;targetID;0]]
            $let[reason;$fetchAuditLog[$guildID;MemberBanAdd;reason;0]]
            $if[$get[reason]==;
                $let[reason;No reason provided (manual ban)]
            ]
            $let[n;$newCase[$guildID;ban;$get[target];$get[executor];;$get[reason]]]
            $!modlogPost[$guildID;$get[n];ban;$get[target];$get[executor];;$get[reason]]
        ]
    `
};
