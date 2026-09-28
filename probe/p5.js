module.exports = {
    name: "p5",
    type: "messageCreate",
    code: `
$nomention
$!jsonLoad[a;{}]
$!jsonSet[a;direct;$channelID]
$let[r1;$env[a;direct]]

$let[throughlet;$channelID]
$!jsonLoad[b;{}]
$!jsonSet[b;indirect;$get[throughlet]]
$let[r2;$env[b;indirect]]

$let[r3;$charCount[$get[r1]]]
$let[r4;$charCount[$get[r2]]]

$description[direct-len ($get[r3]) | indirect-len ($get[r4]) | raw ($env[b;indirect])]
    `
};
