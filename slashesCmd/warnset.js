/*
 * Chronolith — warnset: Configure warn escalation
 * Slash command (mirrors the %warnset prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "warnset",
        description: "Configure warn escalation",
        options: [
            { type: 4, name: "threshold", description: "Warns before action", required: true },
            { type: 3, name: "action", description: "mute, kick, ban or none", required: true },
            { type: 3, name: "duration", description: "For mute (e.g. 1h)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;warns;threshold;$option[threshold]]
$!jsonSet[cfg;warns;action;$option[action]]
$!jsonSet[cfg;warns;duration;$if[$option[duration]!=;$option[duration];1h]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[⚠️ Escalation configured.]]
    `
};
