module.exports = {
    name: "p31",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$authorID==$botOwnerID;]
$let[until;$math[$getTimestamp+300000]]
$ban[$guildID;1553806204885798952;direct ban test — expires $discordTimestamp[$get[until];RelativeTime]]
$setGuildVar[tb_1553806204885798952;$get[until];$guildID]
$let[all;$getGuildVar[tb_all;$guildID;]]
$if[$get[all]!=;
$setGuildVar[tb_all;$get[all],1553806204885798952;$guildID];
$setGuildVar[tb_all;1553806204885798952;$guildID]
]
$description[direct-ban result=($get[until]) | tb_all=($getGuildVar[tb_all;$guildID;])]
    `
};
