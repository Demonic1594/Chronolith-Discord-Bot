module.exports = {
    name: "botinfo",
    type: "messageCreate",
    code: `
$color[#ff8c42]
$description[# 🤖 Bot Information
Welcome to the bot information panel.
### 📊 Statistics
> Servers: **$guildCount**
> Users: **$userCount**
> Commands: **$sum[$applicationCommandCount[$guildID;true];$commandCount[messageCreate]]**
> Uptime: $parseMS[$uptime]
### ⚙️ System Information
> Ping: **$pingms**
> Memory Usage: **$round[$ram]mb**
> CPU Usage: **$cpu%**
> Node.js: **$nodeVersion**
### 🏷️ General Information
> Prefix: **$getGlobalVar[prefix]**
> Owner: **<@$botOwnerID>**]
`}