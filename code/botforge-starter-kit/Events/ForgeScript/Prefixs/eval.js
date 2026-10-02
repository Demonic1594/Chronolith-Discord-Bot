module.exports = {
    name: "eval",
    aliases: ["e"],
    type: "messageCreate",
    code: `
$onlyIf[$or[$authorID==$botOwnerID;$hasRoles[$guildID;$authorID;$djsEval[process.env.TeamRoleID]]];You are not allowed to use this command!]
$onlyIf[$message!=;Please provide code to evaluate.]
$eval[$message;false]
`}