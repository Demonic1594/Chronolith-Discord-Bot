/*
 * Chronolith engine — snipe cache reader.
 *
 * events/ handlers store deleted/edited messages in guild vars:
 *   `snipe_<channelID>`  → JSON array (newest first, capped at 5) of
 *                          { a: authorID, c: content, t: ms }
 *   `esnipe_<channelID>` → same, for edits { a, before, after, t }
 *
 * $snipeGet[guild;channel;kind;index] → JSON string of one entry (or empty)
 */

module.exports = [
    {
        name: "snipeGet",
        params: ["guild", "channel", "kind", "index"],
        code: `
            $let[raw;$getGuildVar[$env[kind]_$env[channel];$env[guild];]]
            $if[$get[raw]==;
                $return[]
            ]
            $jsonLoad[list;$get[raw]]
            $return[$env[list;$env[index]]]
        `
    }
];
