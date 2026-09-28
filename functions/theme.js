/*
 * Chronolith engine — visual identity.
 *
 * One palette everywhere (commands embed these hexes inline; events read
 * them through $theme so the generator stays out of runtime paths):
 *
 *   primary  7C3AED  violet   — brand, info, help, config
 *   danger   EF4444  red      — bans, kicks, lockdown, alerts
 *   warn     F59E0B  amber    — warnings, automod notices
 *   success  22C55E  green    — success confirmations, joins
 *   mute     9B59B6  purple   — mutes, quarantine
 *   muted    64748B  slate    — utility output (snipe, avatars)
 */

module.exports = [
    {
        name: "theme",
        params: ["role"],
        code: `
            $if[$env[role]==danger;
                $return[EF4444]
            ]
            $if[$env[role]==warn;
                $return[F59E0B]
            ]
            $if[$env[role]==success;
                $return[22C55E]
            ]
            $if[$env[role]==mute;
                $return[9B59B6]
            ]
            $if[$env[role]==muted;
                $return[64748B]
            ]
            $return[7C3AED]
        `
    },
    {
        // Title marker per action — the visual grammar of the modlog.
        name: "actionEmoji",
        params: ["action"],
        code: `
            $if[$env[action]==warn;
                $return[⚠️ Warning]
            ]
            $if[$env[action]==mute;
                $return[🔇 Muted]
            ]
            $if[$env[action]==unmute;
                $return[🔊 Unmuted]
            ]
            $if[$env[action]==kick;
                $return[👟 Kicked]
            ]
            $if[$env[action]==ban;
                $return[🔨 Banned]
            ]
            $if[$env[action]==softban;
                $return[🧹 Softbanned]
            ]
            $if[$env[action]==unban;
                $return[🕊️ Unbanned]
            ]
            $if[$env[action]==tempban;
                $return[⏳ Tempbanned]
            ]
            $if[$env[action]==quarantine;
                $return[🧪 Quarantined]
            ]
            $if[$env[action]==unquarantine;
                $return[♻️ Released]
            ]
            $if[$env[action]==note;
                $return[📝 Note]
            ]
            $if[$env[action]==automod;
                $return[🛡️ Automod]
            ]
            $if[$env[action]==nuke;
                $return[☢️ Anti-nuke]
            ]
            $if[$env[action]==gate;
                $return[🚪 Join gate]
            ]
            $if[$env[action]==raid;
                $return[🌊 Raid alert]
            ]
            $return[📌 Case]
        `
    }
];
