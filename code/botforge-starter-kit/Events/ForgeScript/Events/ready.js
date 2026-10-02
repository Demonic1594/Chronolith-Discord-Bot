require("dotenv").config()
module.exports = {
    type: "clientReady",
    code: `
$log[]
$log[]
$chalkLog[━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━;cyanBright]
$chalkLog[Bot is now online.;greenBright;bold]
$chalkLog[Loading commands and extensions...;yellowBright]
$chalkLog[Initialization completed successfully.;green]
$chalkLog[━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━;cyanBright]
$log[]
$log[]
    `
};