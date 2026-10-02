module.exports = {
    name: "p32",
    type: "messageCreate",
    code: `
$nomention
$let[all;$timedList[$guildID]]
$description[moderations-raw=($get[all])]
    `
};
