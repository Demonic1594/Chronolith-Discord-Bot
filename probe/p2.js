module.exports = {
    name: "p2",
    type: "messageCreate",
    code: `
$nomention
$!jsonLoad[j;$getGuildVar[probe;$guildID;{}]]
$!jsonSet[j;lit_negated;A]
$setGuildVar[probe;$jsonStringify[j];$guildID]
$!jsonLoad[j2;$getGuildVar[probe;$guildID;{}]]
$let[r1;$env[j2;lit_negated]]

$!jsonLoad[j3;{}]
$jsonSet[j3;lit_plain;B]
$setGuildVar[probe2;$jsonStringify[j3];$guildID]
$!jsonLoad[j4;$getGuildVar[probe2;$guildID;{}]]
$let[r2;$env[j4;lit_plain]]

$let[dkey;$math[1+1]]
$!jsonLoad[j5;{}]
$!jsonSet[j5;$get[dkey];C]
$setGuildVar[probe3;$jsonStringify[j5];$guildID]
$!jsonLoad[j6;$getGuildVar[probe3;$guildID;{}]]
$let[r3;$env[j6;2]]

$description[neg-literal: ($get[r1]) | plain-literal: ($get[r2]) | single-dyn-key: ($get[r3])]
    `
};
