module.exports = {
name: "id-search",
aliases: ["id"],
type: "messageCreate",
usage: "Id-search <ID>",
description: "Search for an ID",
category: "Utility",
code: `
$let[color;#0000ff]
$let[inq;$message[0]]

$ifx[
$if[$userExists[$get[inq]];$let[type;user]]
$elseIf[$channelExists[$get[inq]];$let[type;channel]]
$elseIf[$emojiExists[$get[inq]];$let[type;emoji]]
$elseIf[$roleExists[$guildID;$get[inq]];$let[type;role]]
$else[$let[type;none]]
]

$onlyIf[$get[type]!=none;
$addContainer[
$addTextDisplay[Please provide a valid ID!
-# available ID types - user, channel, emoji and role]
;#ff0000]
]

$addContainer[
$addTextDisplay[## ID information
-# Type: $get[type]]

$c[USER INFORMATION]
$if[$get[type]==user;
$addSeparator
$addSection[
$addThumbnail[$userAvatar[$get[inq]]]

$c[BASIC USER INFORMATIONS]
$addTextDisplay[### User Profile - 
User: <@$get[inq]> (\`$userTag[$get[inq]]\`)
-# > ID: $get[inq]
Bot?: **$if[$isBot[$get[inq]];Yes ($if[$isBotVerified[$get[inq]];Verified;Not verified]);No]**
Account creation date: **$parseDate[$userCreatedAt[$get[inq]];LocaleDate]**
]
]
$addSeparator

$c[GUILD MEMBER INFORMATIONS]
$if[$memberExists[$guildID;$get[inq]];
$addSection[
$addThumbnail[$memberAvatar[$guildID;$get[inq]]]
$addTextDisplay[### Server Profile -
Nickname: **$if[$nickname[$guildID;$get[inq]]==;No nickname;$nickname[$guildID;$get[inq]]]**
Booster?: **$if[$isBoosting[$guildID;$get[inq]];Yes
-# > Boosting since $parseDate[$memberBoostingSince[$guildID;$get[inq]];LocaleDate];No]**
Joined: **$parseDate[$memberJoinedAt[$guildID;$get[inq]];LocaleDate]**
-# > Member no. $memberJoinPosition[$guildID;$get[inq]]
Platform: **$platform[$guildID;$get[inq]]**
]
]

$addSeparator
$addActionRow
$addButton[idSearch-memberRoles-$get[inq];Roles;Primary]
$addButton[idSearch-memberPerms-$get[inq];Permissions;Primary]

;$addTextDisplay[-# $username[$get[inq]] is not in this server.]
]
]

$c[CHANNEL INFORMATIONS]
$if[$get[type]==channel;
$let[channelType;$channelType[$get[inq]]]
$addTextDisplay[
Channel: <#$get[inq]> (\`$channelName[$get[inq]]\`)
-# > ID: $get[inq]
Type: **$replace[$get[channelType];Guild;]**
Creation Date: **$parseDate[$channelCreatedAt[$get[inq]];LocaleDate]**
]

$if[$get[channelType]!=GuildCategory;
$addTextDisplay[
Category ID: **$channelCategoryID[$get[inq]]**
NSFW?: **$channelNSFW[$get[inq]]**
Position: **$sum[$channelPosition[$get[inq]];1]**
-# > Topic: **$if[$channelTopic[$get[inq]]!=;$channelTopic[$get[inq]];No topic]**
]
;
$addTextDisplay[Channels Count: **$channelChildrenCount[$get[inq]]**]
]
]

$c[ROLE INFORMATIONS]
$if[$get[type]==role;
$nomention
$addTextDisplay[
Role: <@&$get[inq]> (\`$roleName[$guildID;$get[inq]]\`)
-# ID: $get[inq]
Color: **$roleColor[$guildID;$get[inq]]**
Hoisted?: **$roleHoisted[$guildID;$get[inq]]**
Position: **$rolePosition[$guildID;$get[inq];true]**
Mentionable?: **$roleMentionable[$guildID;$get[inq]]**
Creation Data: **$parseDate[$roleCreatedAt[$guildID;$get[inq]];LocaleDate]**
]
$addSeparator
$addActionRow
$addButton[idSearch-roleMembers-$get[inq];Members;Primary]
$addButton[idSearch-rolePerms-$get[inq];Permissions;Primary]
]

$c[EMOJI INFORMATIONS]
$if[$get[type]==emoji;
$addTextDisplay[
Emoji: $emoji[$get[inq]] (\`$emojiName[$get[inq]]\`)
-# ID: $get[inq]
Animated?: **$emojiAnimated[$get[inq]]**
Creation Data: **$parseDate[$emojiCreatedAt[$get[inq]];LocaleDate]**
]
$addTextDisplay[
-# $if[$emojiGuildID[$get[inq]]==$guildID;This emoji is of this server;This emoji is not of this server]
]
]
;$get[color]]
`
}