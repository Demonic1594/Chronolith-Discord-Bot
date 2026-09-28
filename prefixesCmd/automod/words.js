/*
 * Chronolith — words: List banned words
 * Prefix command (mirrors the /words slash command).
 */
module.exports = {
    name: "words",
    aliases: ["wordlist"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-words;3s;]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$let[words;$env[cfg;automod;words]]
$if[$get[words]==;
$description[No banned words configured.];
$description[Banned words]
$addField[Words;$get[words];false]
]
    `
};
