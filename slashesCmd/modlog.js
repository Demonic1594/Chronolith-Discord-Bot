/*
 * Chronolith — modlog: View moderation logs (recent / by user / by action / set channel)
 * Slash command (mirrors the %modlog prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "modlog",
        description: "View moderation logs (recent / by user / by action / set channel)"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$ephemeral
$interactionReply[
$author[Chronolith • Modlog;$userAvatar[$botID;64;png]]
$description[Use the prefix command for log views, or:
-# %modlog recent \\| %modlog user <target> \\| %modlog action <type> \\| %modlog set <#channel|off>]
$color[7C3AED]
]
    `
};
