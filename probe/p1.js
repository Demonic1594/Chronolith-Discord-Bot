module.exports = {
    name: "p1",
    type: "messageCreate",
    code: `
$nomention
$let[k1;protected]
$let[k2;users]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$let[tgt;$authorID]
$arrayLoad[pl;,;$env[cfg;$get[k1];$get[k2]]]
$arrayPush[pl;$get[tgt]]
$!jsonSet[cfg;$get[k1];$get[k2];$arrayJoin[pl;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$let[after;$getGuildVar[cfg;$guildID;{}]]
$!jsonLoad[cfg2;$get[after]]
$description[dynamic-key readback: [$env[cfg2;protected;users]]]
    `
};
