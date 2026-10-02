module.exports = {
    name: "p10",
    type: "messageCreate",
    code: `
$nomention
$description[isMod=($isMod[$guildID;$authorID]) | hasPerms=($hasPerms[$guildID;$authorID;ManageGuild]) | memberExists=($memberExists[$guildID;$authorID]) | roles=($memberRoles[$guildID;$authorID;,])]
    `
};
