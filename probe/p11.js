module.exports = {
    name: "p11",
    type: "messageCreate",
    code: `
$nomention
$description[hara-isMod=($isMod[$guildID;1553806204885798952]) | hara-perms=($hasPerms[$guildID;1553806204885798952;ManageGuild]) | hara-roles=($memberRoles[$guildID;1553806204885798952;,])]
    `
};
