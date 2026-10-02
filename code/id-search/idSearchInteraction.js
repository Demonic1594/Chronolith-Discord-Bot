module.exports = {
type: "interactionCreate",
code: `$arrayLoad[id;-;$customID]
$onlyIf[$arrayAt[id;0]==idSearch]

$c[LOADING TEMPORARY VARIABLES]
$let[color;#0000ff]
$let[act;$arrayAt[id;1]]
$let[inq;$arrayAt[id;2]]

$c[LIST MEMBER'S ROLES]
$if[$get[act]==memberRoles;

$c[CHECK IF THE MEMBER EXISTS IN THE SERVER]
$onlyIf[$memberExists[$guildID;$get[inq]];
$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[Something went wrong]
;#ff0000]
]]

$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[
<@&$memberRoles[$guildID;$get[inq];>, <@&]>
]
;$get[color]]
]
]

$c[LIST MEMBER'S PERMISSIONS]
$if[$get[act]==memberPerms;

$c[CHECK IF THE MEMBER EXISTS IN THE SERVER]
$onlyIf[$memberExists[$guildID;$get[inq]];
$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[Something went wrong]
;#ff0000]
]]

$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[
$if[$memberPerms[$guildID;$get[inq]]==;This member doesn't have any permissions;$memberPerms[$guildID;$get[inq]]]
]
;$get[color]]
]
]

$c[LIST ROLE'S MEMBERS]
$if[$get[act]==roleMembers;

$c[CHECK IF THE ROLE EXISTS IN THE SERVER]
$onlyIf[$roleExists[$guildID;$get[inq]];
$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[Something went wrong]
;#ff0000]
]]

$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[
<@$roleMembers[$guildID;$get[inq];>, <@]>
]
;$get[color]]
]
]

$c[LIST MEMBER'S PERMISSIONS]
$if[$get[act]==rolePerms;

$c[CHECK IF THE ROLE EXISTS IN THE SERVER]
$onlyIf[$roleExists[$guildID;$get[inq]];
$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[Something went wrong]
;#ff0000]
]]

$interactionReply[
$ephemeral
$addContainer[
$addTextDisplay[
$if[$rolePerms[$guildID;$get[inq]]==;This role doesn't have any permissions;$rolePerms[$guildID;$get[inq]]]
]
;$get[color]]
]
]
`
}