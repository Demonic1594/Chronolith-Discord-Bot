/*
 * Chronolith engine — configuration + permission gates.
 *
 * Per-guild config is a single JSON object stored in the guild variable
 * `cfg`. List-shaped values are stored as comma-separated ID strings
 * (not JSON arrays) so they can be split cleanly with $arrayLoad.
 *
 * Shape (all keys optional):
 * {
 *   "modlog":    "<channel id>",         // where case embeds are posted
 *   "muterole":  "<role id>",
 *   "modroles":  "id1,id2",              // CSV of roles that count as moderator
 *   "warns":     { "threshold": 3, "action": "timeout", "duration": "1h" },
 *   "automod":   { "invites": false, "words": "word1,word2", "mentionLimit": 6,
 *                  "caps": false, "capsMin": 12, "capsRatio": 70 },
 *   "joingate":  { "minAgeDays": 0, "joins": 8, "window": 60, "action": "lockdown" },
 *   "autorole":  "<role id>",
 *   "logs":      { "joinleave": "", "msglogs": "", "serverlogs": "" }
 * }
 *
 * Gate pattern used by every moderation command (isMod returns true/false):
 *   $onlyIf[$isMod[$guildID;$authorID]==true;⛔ Not a moderator.]
 */

module.exports = [
    {
        name: "modlogChannel",
        params: ["guild"],
        code: `
            $jsonLoad[cfg;$getGuildVar[cfg;$env[guild];{}]]
            $return[$env[cfg;modlog]]
        `
    },
    {
        name: "logChannel",
        params: ["guild", "kind"],
        code: `
            $jsonLoad[cfg;$getGuildVar[cfg;$env[guild];{}]]
            $return[$env[cfg;logs;$env[kind]]]
        `
    },
    {
        // true/false — is this user a moderator here?
        // Mods = bot owner, anyone with ManageGuild, or holders of a configured mod role.
        name: "isMod",
        params: ["guild", "user"],
        code: `
            $if[$env[user]==$botOwnerID;
                $return[true]
            ]
            $if[$hasPerms[$env[guild];$env[user];ManageGuild]==true;
                $return[true]
            ]
            $jsonLoad[cfg;$getGuildVar[cfg;$env[guild];{}]]
            $if[$env[cfg;modroles]!=;
                $arrayLoad[mods;,;$env[cfg;modroles]]
                $arrayLoad[have;,;$memberRoles[$env[guild];$env[user];,]]
                $arrayForEach[mods;r;
                    $if[$arrayIncludes[have;$env[r]];
                        $return[true]
                    ]
                ]
            ]
            $return[false]
        `
    }
];
