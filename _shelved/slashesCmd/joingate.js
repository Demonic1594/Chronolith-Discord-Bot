/*
 * Chronolith — joingate: Configure anti-raid join gate
 * Slash command (mirrors the %joingate prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "joingate",
        description: "Configure anti-raid join gate",
        options: [
            { type: 4, name: "minagedays", description: "Min account age in days (0 = off)", required: true },
            { type: 4, name: "joins", description: "Joins before raid alert", required: true },
            { type: 4, name: "window", description: "Window in seconds", required: true },
            { type: 3, name: "action", description: "alert or lockdown", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;joingate;minAgeDays;$option[minagedays]]
$!jsonSet[cfg;joingate;joins;$option[joins]]
$!jsonSet[cfg;joingate;window;$option[window]]
$!jsonSet[cfg;joingate;action;$if[$option[action]!=;$option[action];alert]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[🚪 Join gate configured.]]
    `
};
