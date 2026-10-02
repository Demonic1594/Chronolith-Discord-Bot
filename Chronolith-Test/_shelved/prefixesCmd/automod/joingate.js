/*
 * Chronolith — joingate: Configure anti-raid join gate
 * Prefix command (mirrors the /joingate slash command).
 */
module.exports = {
    name: "joingate",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-joingate;3s;]
$onlyIf[$message[0]!=;Usage: joingate <minAgeDays> <joins> <windowSec> \\[lockdown\\]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;joingate;minAgeDays;$message[0]]
$!jsonSet[cfg;joingate;joins;$message[1]]
$!jsonSet[cfg;joingate;window;$message[2]]
$!jsonSet[cfg;joingate;action;$if[$message[3]!=;$message[3];alert]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🚪 Join gate: accounts under $message[0] days kicked; $message[1] joins / $message[2]s triggers $if[$message[3]!=;$message[3];alert].]
    `
};
