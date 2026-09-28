module.exports = {
    name: "p3",
    type: "messageCreate",
    code: `
$nomention
$let[ch;1554038045366427749]
$jsonLoad[lr;{}]
$jsonLoad[e;{}]
$jsonSet[e;r;raid]
$jsonSet[e;u;123]
$jsonSet[lr;$get[ch];$jsonStringify[e]]
$setGuildVar[p3reg;$jsonStringify[lr];$guildID]
$jsonLoad[back;$getGuildVar[p3reg;$guildID;{}]]
$let[a;$env[back;$get[ch];r]]
$let[b;$env[back;$get[ch];u]]
$jsonLoad[t2;{}]
$jsonSet[t2;$get[ch];u;777]
$let[c;$env[t2;$get[ch];u]]
$description[dyn-with-obj: ($get[a],$get[b]) | dynlit-keys: ($get[c])]
    `
};
