module.exports = {
    name: "p12",
    type: "messageCreate",
    code: `
$nomention
$description[self-isMod=($isMod[$guildID;$authorID]) | author=($authorID) | guild=($guildID)]
    `
};
