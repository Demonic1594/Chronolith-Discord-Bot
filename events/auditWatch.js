/*
 * Chronolith — anti-nuke watcher (guildAuditLogEntryCreate).
 *
 * Dangerous actions by non-whitelisted members are counted and answered by
 * the engine (functions/antinuke.js). Whitelist = mods (ManageServer,
 * modrole holders, bot owner). Both camelCase and SNAKE_CASE action names
 * are matched defensively — the audit property's exact formatting is not
 * something to bet a security feature on.
 */

module.exports = {
    type: "guildAuditLogEntryCreate",
    code: `
        $let[a;$auditLog[action]]
        $let[danger;$or[
            $checkContains[$get[a];ChannelDelete;RoleDelete;WebhookDelete;MemberBanAdd;MemberKick;MemberPrune];
            $or[
                $checkContains[$get[a];CHANNEL_DELETE;ROLE_DELETE;WEBHOOK_DELETE];
                $checkContains[$get[a];MEMBER_BAN_ADD;MEMBER_KICK;MEMBER_PRUNE]
            ]
        ]]
        $if[$get[danger]==true;
            $let[r;$anCheck[$guildID;$get[a];$auditLog[targetID]]]
        ]
    `
};
