module.exports = {
    name: "p40",
    type: "messageCreate",
    code: `
$nomention
$let[admin;$hasPerms[$guildID;$botID;Administrator]]
$let[banp;$hasPerms[$guildID;$botID;BanMembers]]
$let[isb;$isBannable[$guildID;$authorID]]
$let[chk;$punishCheck[$guildID;$authorID;1553804378475864156;hardban]]
$description[admin=($get[admin]) | banp=($get[banp]) | isBannable=($get[isb]) | chk=($get[chk])]
    `
};
