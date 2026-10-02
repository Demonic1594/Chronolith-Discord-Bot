/*
 * Chronolith engine — visual identity v2.
 *
 * Design language: "dark crystal" — deep colors, clean typography,
 * consistent iconography, no visual noise. Every embed shares:
 *   - Author header with the relevant user's avatar + action context
 *   - Description as the primary content (blockquoted reasons)
 *   - Inline fields for metadata (compact, scannable)
 *   - Footer with "Chronolith" branding
 *   - Timestamps on all logged actions
 *
 * Palette:
 *   primary  5865F2  blurple  — brand, info, neutral actions
 *   danger   F23F24  red      — bans, kicks, hardbans, lockdown, nuke
 *   warning  F0B232  amber    — warnings, automod triggers
 *   success  248046  green    — success confirmations, unbans, joins
 *   mute     9B59B6  purple   — mutes, timeouts, quarantine
 *   subtle   4E5058  slate    — utility, notes, case detail views
 */

module.exports = [
    {
        name: "theme",
        params: ["role"],
        code: `
            $if[$env[role]==danger;
                $return[F23F24]
            ]
            $if[$env[role]==warning;
                $return[F0B232]
            ]
            $if[$env[role]==success;
                $return[248046]
            ]
            $if[$env[role]==mute;
                $return[9B59B6]
            ]
            $if[$env[role]==subtle;
                $return[#4E5058]
            ]
            $return[5865F2]
        `
    },
    {
        name: "actionColor",
        params: ["action"],
        code: `
            $if[$env[action]==ban;
                $return[F23F24]
            ]
            $if[$env[action]==softban;
                $return[F23F24]
            ]
            $if[$env[action]==hardban;
                $return[F23F24]
            ]
            $if[$env[action]==kick;
                $return[F23F24]
            ]
            $if[$env[action]==nuke;
                $return[F23F24]
            ]
            $if[$env[action]==gate;
                $return[F23F24]
            ]
            $if[$env[action]==warn;
                $return[F0B232]
            ]
            $if[$env[action]==automod;
                $return[F0B232]
            ]
            $if[$env[action]==raid;
                $return[F0B232]
            ]
            $if[$env[action]==mute;
                $return[9B59B6]
            ]
            $if[$env[action]==unmute;
                $return[9B59B6]
            ]
            $if[$env[action]==quarantine;
                $return[9B59B6]
            ]
            $if[$env[action]==unquarantine;
                $return[9B59B6]
            ]
            $if[$env[action]==unban;
                $return[248046]
            ]
            $return[5865F2]
        `
    },
    {
        name: "actionEmoji",
        params: ["action"],
        code: `
            $if[$env[action]==warn;
                $return[⚠️ Warning]
            ]
            $if[$env[action]==mute;
                $return[🔇 Timeout]
            ]
            $if[$env[action]==unmute;
                $return[🔊 Timeout Lifted]
            ]
            $if[$env[action]==kick;
                $return[👢 Kicked]
            ]
            $if[$env[action]==ban;
                $return[🔨 Banned]
            ]
            $if[$env[action]==softban;
                $return[🧹 Softban]
            ]
            $if[$env[action]==hardban;
                $return[⏳ Timed Ban]
            ]
            $if[$env[action]==unban;
                $return[🕊️ Unbanned]
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
                $return[🚪 Join Gate]
            ]
            $if[$env[action]==raid;
                $return[🌊 Raid Alert]
            ]
            $if[$env[action]==lock;
                $return[🔒 Lockdown]
            ]
            $if[$env[action]==tempban;
                $return[⏳ Timed Ban]
            ]
            $return[📌 Case]
        `
    }
];