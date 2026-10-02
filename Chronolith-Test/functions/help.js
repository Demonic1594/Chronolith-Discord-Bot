/*
 * Chronolith engine — help pages (v4, per the command plan + Phase 1).
 * $helpPages      → number of pages
 * $helpPage[n]    → text listing for page n (0-based)
 * Flat early-return blocks; in-text semicolons are escaped.
 */

module.exports = [
    {
        name: "helpPages",
        params: [],
        code: "$return[8]"
    },
    {
        name: "helpPage",
        params: ["n"],
        code: `
$if[$env[n]==0;
$return[Punishments
%warn <user> \[reason\] — warn one user (auto-escalates)
%kick <targets...> \[reason\] — kick one or more
%ban <targets...> \[reason\] — PERMANENT ban, no messages deleted
%hardban <targets...> <duration> \[reason\]
Hardban bans a user for a specified duration and automatically unbans them when the duration expires. The duration can appear before or after the reason.
Example: %hardban @User 7d Repeated violations
%softban <targets...> \[reason\] — ban + instant unban, removes recent messages
%unban <ids...> \[reason\] — unban by ID
%mute <targets...> <duration> \[reason\] — timeout (duration required)
%unmute <targets...> \[reason\] — remove timeouts
%moderations — active hardbans, timeouts and lockdowns with time left
Targets accept mentions, usernames, IDs — or reply to a message]
]
$if[$env[n]==1;
$return[Warnings & cases
%removewarning <user> <case ids...> — also: delwarn, deletewarnings...
%clearwarns <targets...> — wipe warnings for one or more
%cases <targets...> — full infraction history (alias: %infractions)
%case <number> — inspect one case
%modlog — recent logs · %modlog user <target> · %modlog action <type>
Every action records the moderator, reason, duration and timestamp]
]
$if[$env[n]==2;
$return[Notes & stats
%addnote <user> <content> — attach a staff note (alias: %setnote)
%notes <user> — list a user's notes with authors and times
%editnote <id> <content> — edit, original author kept, editor recorded
%removenote <ids...> — remove by note ID (also: delnote, deletenote...)
%clearnotes <targets...> — wipe notes for one or more
%modstats \[@moderator\] — that moderator's action counts]
]
$if[$env[n]==3;
$return[Lockdown
%lock \[#channel|server\] \[duration\] \[reason\] — order-independent
Examples: %lock · %lock #general · %lock server 30m raid · %lock 1h maintenance
%unlock \[#channel|server\] \[reason\] — skips channels that aren't locked
Durations auto-unlock, reasons are logged with the acting moderator]
]
$if[$env[n]==4;
$return[Purge & cleanup
%purge \[mode\] \[search=100\] \[extra\] — modes:
all (mine) · bot \[prefix\] · contains <text> · embeds · emoji · files
images · links · mentions (pings) · human · reactions
Pinned messages are ignored. %cleanup \[search\] — my messages, pinned included]
]
$if[$env[n]==5;
$return[Reports
%report <user> <reason> — files a numbered report (reason required)
%reports \[open|claimed|resolved|dismissed|all|<id>\] — list or view
%claim <id> · %close <id> \[note\] · %dismiss <id> · %archivereport <id>
%setreportchannel <#channel> — where reports land (mods)]
]
$if[$env[n]==6;
$return[Security & setup
%antinuke <on|off> \[threshold\] \[ban|kick|strip\] · %verify <role|off>
%joingate <days> <joins> <windowSec> \[lockdown\] · %automod <module> <on|off>
%config — settings dashboard · %quicksetup — sane defaults
%modrole · %protect <role|user> <add|remove> · %dmnotices <on|off>
%muterole · %warnset · %autorole · %logs · %tickets]
]
$if[$env[n]==7;
$return[Info & utility
%userinfo \[user\] · %serverinfo · %roleinfo <role> · %banner \[user\]
%avatar \[user\] · %inrole <role> · %stats · %snipe · %editsnipe
%ticket — private channel with the mods · %help · %ping
-# Every command exists as a slash command too. Mods = ManageServer, %modrole holders, or the bot owner. The server owner cannot be moderated.]
]
$return[Unknown page]
        `
    }
];
