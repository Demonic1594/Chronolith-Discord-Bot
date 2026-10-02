/*
 * Chronolith — eval: Owner-only: evaluate ForgeScript
 * Prefix command (mirrors the /eval slash command).
 */
module.exports = {
    name: "eval",
    type: "messageCreate",
    code: `
$onlyForUsers[;$botOwnerID]
$let[result;$trim[$eval[$message;false]]]
$if[$charCount[$get[result]]>1900;
$attachment[$get[result];result.txt;true];
$get[result]
]
$try[$!addMessageReactions[$channelID;$messageID;✅]]
    `
};
