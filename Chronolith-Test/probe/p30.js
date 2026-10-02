module.exports = {
    name: "p30",
    type: "messageCreate",
    code: `
$nomention
$description[haraisBannable=($isBannable[$guildID;1553806204885798952]) | amaisMember=($memberExists[$guildID;1553811167200419931]) | amaisBannable=($isBannable[$guildID;1553811167200419931]) | checkHara=($punishCheck[$guildID;$authorID;1553806204885798952;hardban]) | checkAma=($punishCheck[$guildID;$authorID;1553811167200419931;hardban])]
    `
};
