#!/usr/bin/env python3
"""Generate Chronolith's prefix + slash command files from one spec source.

Keeping the mirrors in one spec keeps them from drifting apart: the prefix
body and the slash body share the same engine calls, differing only in
input capture (message args vs $option) and reply shape.

Run from the repo root:  python3 tools/gen_commands.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PREFIX_GATE = """$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-{name};3s;]"""

SLASH_GATE = """$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]"""

OPEN_PREFIX_GATE = """$nomention
$onlyIf[$guildID!=;Server only.]"""

OWNER_GATE = "$onlyForUsers[;$botOwnerID]"

# channel mention (<#id>) / role mention (<@&id>) → raw id
CH_STRIP = "$replace[$replace[$message[0];<#;];>;]"
ROLE_STRIP = "$replace[$replace[$message[0];<@&;];>;]"


def duration_token(t):
    """A token like 30s / 5m / 2h / 1d (case-insensitive)."""
    t = t.strip()
    return len(t) >= 2 and t[-1].lower() in "smhd" and t[:-1].isdigit()


def split_duration_reason(tokens):
    """Order-independent: first duration-looking token becomes the duration,
    everything else joins the reason (plan requirement)."""
    dur = ""
    reason = []
    for t in tokens:
        if not dur and duration_token(t):
            dur = t
        else:
            reason.append(t)
    return dur, " ".join(reason)


CMDS = []


def _fix_seps(code):
    """Commas at TOP-LEVEL (depth 0 relative to the $and/$or body) are condition
    separators and must become semicolons. Commas inside NESTED function calls
    (depth > 0) are argument separators and must be preserved."""
    for fname in ("$and", "$or"):
        idx = 0
        while True:
            j = code.find(fname + "[", idx)
            if j < 0:
                break
            depth = 0
            k = j + len(fname) + 1  # position AFTER the opening [
            start = k  # start of the body content
            nest = 0  # nesting depth INSIDE the body (0 = directly in the body)
            while k < len(code):
                c = code[k]
                if c == "\\":
                    k += 2
                    continue
                if c == "[":
                    nest += 1
                elif c == "]":
                    if nest <= 0:
                        break  # closing the $and/$or itself
                    nest -= 1
                elif c == "," and nest == 0:
                    # Top-level comma inside $and/$or → replace with ;
                    code = code[:k] + ";" + code[k+1:]
                k += 1
            idx = j + 1  # re-scan for NESTED $and/$or bodies too
    return code


def _postfix(body):
    """Fix comma separators in $and/$or, negate top-level value-returning
    calls, and negate jsonSet/jsonLoad to prevent true/false output leaks.
    Bare bracket lines are PRESERVED (they're $if closing brackets)."""
    body = _fix_seps(body)
    
    NEGATE = {
        "$jsonSet", "$jsonLoad", "$setGuildVar", "$arrayPush", "$arraySplice",
        "$arrayLoad", "$arrayMap", "$arrayFilter", "$arrayForEach", "$arraySlice",
        "$setChannelSlowmode", "$ban", "$unban", "$kick", "$timeout",
        "$memberAddRoles", "$memberRemoveRoles", "$memberSetNickname",
        "$createChannel", "$deleteMessage", "$clearMessages", "$clearUserMessages",
        "$addChannelPerms", "$removeChannelPerms", "$deleteChannelPerms",
        "$deleteAllMessageReactions", "$sendDM", "$jsonDelete",
        "$lockChan", "$unlockChan", "$lockAll", "$unlockAll",
        "$tempbanSweep", "$lockSweep",
    }
    
    out = []
    for ln in body.split("\n"):
        st = ln.lstrip()
        indent = ln[:len(ln) - len(st)]
        if not st:
            out.append(ln)
            continue
        if not st.startswith("$!") and not st.startswith("$#"):
            for fn in NEGATE:
                if st.startswith(fn + "["):
                    # Only skip if this fn is embedded inside another call's ARGUMENT
                    # (i.e., there's meaningful code before it on the same line)
                    before = st[:st.index(fn)]
                    if before.strip() == "":
                        # Standalone statement — safe to negate
                        ln = indent + st.replace("$", "$!", 1)
                    elif not any(x in before for x in (
                        "$let[", "$return[", "$description[", "$addField[",
                        "$author[", "$title[", "$footer[", "$color[",
                        "$interactionReply[", "$sendMessage[", "$thumbnail[",
                        "$image[", "$if[",
                    )):
                        ln = indent + st.replace("$", "$!", 1)
                    break
        out.append(ln)
    return "\n".join(out)


def duration_scan_block():
    """Order-independent duration extraction from the parsed reason tokens."""
    return """$let[dur;]
$let[rest;]
$if[$env[tj;reason]!=;
$arrayLoad[rt; ;$env[tj;reason]]
$arrayForEach[rt;w;
$if[$and[$get[dur]==,$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true]==true;
$let[dur;$env[w]]
;
$let[rest;$get[rest]$if[$get[rest]!=; ]$env[w]]
]
]
]
"""


PUNISH_ALIASES = {
    "mute": ["timeout"],
    "unmute": ["untimeout"],
    "removewarning": ["removewarnings", "deletewarning", "deletewarnings", "delwarn", "delwarns"],
}


FOLDER_MODULE = {
    "mod": "Moderation", "config": "Configuration", "channel": "Channels",
    "cases": "Modlog", "modlog": "Modlog", "notes": "Notes",
    "reports": "Reports", "automod": "Automod", "misc": "Utility",
    "info": "Utility", "core": "Utility",
}


def _fix_footers(body, folder):
    """Every embed footer carries its module: Chronolith • <Module>."""
    module = FOLDER_MODULE.get(folder)
    if not module:
        return body
    return body.replace("$footer[Chronolith]",
                        f"$footer[Chronolith • {module}]")


def cmd(folder, name, aliases, desc, prefix, slash, options=None, gate="mod"):
    CMDS.append(dict(folder=folder, name=name, aliases=aliases, desc=desc,
                     prefix=_fix_footers(_postfix(prefix), folder),
                     slash=_fix_footers(_postfix(slash), folder) if slash else slash,
                     options=options or [], gate=gate))



HAMMER_IMG = "https://cdn.discordapp.com/emojis/1129080609248137266.png?size=4096"
ACTION_STYLE = {
    "ban": ("The Ban Hammer has spoken!", True),
    "hardban": ("The Ban Hammer has spoken!", True),
    "softban": ("The Ban Hammer has swept clean!", True),
    "kick": ("The Boot has spoken!", False),
    "mute": ("Silence has been decreed.", False),
    "unmute": ("Silence has been lifted.", False),
    "quarantine": ("Isolation has been ordered.", False),
    "unquarantine": ("Isolation has ended.", False),
    "warn": ("The Warning stands.", False),
    "note": ("For the record.", False),
    "unban": ("The Ban Hammer retracts.", True),
}

def multi_punish_cmd(name, action, aliases, desc, duration_required=False, duration_optional=False, unban_button=False):
    aliases = list(aliases)
    if name in PUNISH_ALIASES:
        aliases = list(dict.fromkeys(aliases + PUNISH_ALIASES[name]))  # dedupe preserving order
    reason_expr = "$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]"
    pfx = f"""$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]"""
    if duration_required:
        pfx += "\n" + duration_scan_block() + "\n$onlyIf[$get[dur]!=;A duration is required: " + name + " <targets> <duration> \\[reason\\]]"
    else:
        pfx += "\n$let[dur;]\n$let[rest;$env[tj;reason]]"
    pfx += f"""
$let[r;$punishMulti[{name};$guildID;$authorID;$env[tj;ids];$get[dur];{reason_expr}]]
$jsonLoad[rj;$get[r]]
$title[**__%TITLE%__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[{name}]]
$description[• **Action :** `{name}`
$if[$checkContains[$env[tj;ids];,]!=true;
> **Member:** [$username[$env[tj;ids]]\\](https://discord.com/users/$env[tj;ids])
;
> **Members:** <@$env[tj;ids]>
]
> **Reason:** `$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
$thumbnail[$userAvatar[$authorID;128;png]]
$addField[Applied;$env[rj;ok];true]
$addField[Skipped;$env[rj;fail];true]
$footer[Chronolith • Moderation]
$timestamp"""
    if unban_button:
        pfx += """
$if[$checkContains[$env[tj;ids];,]!=true;
$addActionRow
$addButton[bunban-$env[tj;ids]-$authorID;Unban;Success]
]"""
    slx = f"""$let[t;$resolveTargets[$guildID;$option[targets];$channelID;$messageID]]
$jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;$ephemeral No valid target found.]"""
    if duration_required:
        slx += "\n$onlyIf[$option[duration]!=;$ephemeral A duration is required.]"
    slx += f"""
$let[r;$punishMulti[{name};$guildID;$authorID;$env[tj;ids];$option[duration];$if[$option[reason]==;No reason provided;$option[reason]]]]
$jsonLoad[rj;$get[r]]
$interactionReply[
$title[**__%TITLE%__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[{name}]]
$description[• **Action :** `{name}`
$if[$checkContains[$env[tj;ids];,]!=true;
> **Member:** [$username[$env[tj;ids]]\\](https://discord.com/users/$env[tj;ids])
;
> **Members:** <@$env[tj;ids]>
]
> **Reason:** `$if[$option[reason]==;No reason provided;$option[reason]]`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
$thumbnail[$userAvatar[$authorID;128;png]]
$addField[Applied;$env[rj;ok];true]
$addField[Skipped;$env[rj;fail];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$env[tj;ids];,]!=true;
$addActionRow
$addButton[bunban-$env[tj;ids]-$authorID;Unban;Success]
]
]"""
    _title, _img = ACTION_STYLE.get(name, (name.capitalize() + " executed.", False))
    if _img:
        _img_line_pfx = "\n$image[" + HAMMER_IMG + "]"
        _img_line_slx = "\n$image[" + HAMMER_IMG + "]"
    else:
        _img_line_pfx = _img_line_slx = ""
    pfx = pfx.replace("%TITLE%", _title) + _img_line_pfx
    slx = slx.replace("%TITLE%", _title) + _img_line_slx
    opts = [{"type": 3, "name": "targets", "description": "Mentions/usernames/IDs (space separated)", "required": True}]
    if duration_optional or duration_required:
        opts.append({"type": 3, "name": "duration", "description": "e.g. 30s, 5m, 2h, 1d", "required": duration_required})
    opts.append({"type": 3, "name": "reason", "description": "Reason", "required": False})
    cmd("mod", name, aliases, desc, pfx, slx, opts)


multi_punish_cmd("kick", "kick", [], "Kick one or more users")
multi_punish_cmd("ban", "ban", ["hackban"], "Ban one or more users (optional duration = auto-unban)", unban_button=True)
multi_punish_cmd("mute", "mute", ["timeout"], "Timeout one or more users (duration required)", duration_required=True)
multi_punish_cmd("unmute", "unmute", ["untimeout"], "Remove timeouts from one or more users")
multi_punish_cmd("softban", "softban", [], "Softban a user (ban + day purge + unban)")

cmd("mod", "warn", [], "Warn a user (auto-escalates at threshold)",
    """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user. Check the ID/mention/name.]
$let[r;$punish[warn;$guildID;$authorID;$get[target];;$message[1;999]]]
$color[$actionColor[warn]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[warn];$userAvatar[$get[target];32;png]]
$description[<@$get[target]> — $userTag[$get[target]]

> $if[$message[1;999]==;No reason provided;$message[1;999]]]
$addField[Case;#$get[r];true]
$addField[Total;$warnCount[$guildID;$get[target]];true]
]
$footer[Chronolith]
$timestamp""",
    """$let[r;$punish[warn;$guildID;$authorID;$option[user];;$option[reason]]]
$interactionReply[
$color[$actionColor[warn]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[warn];$userAvatar[$option[user];64;png]]
$description[**$userTag[$option[user]]**
> $if[$option[reason]==;No reason provided;$option[reason]]]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Moderation]
]""",
    [{"type": 6, "name": "user", "description": "Target user", "required": True},
     {"type": 3, "name": "reason", "description": "Reason", "required": False}])

rmw_prefix = """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$let[removed;0]
$arrayLoad[wids; ;$message[1;999]]
$arrayForEach[wids;w;
$let[d;$caseRemove[$guildID;$env[w]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;None of those case IDs exist for that user.]
$description[🗑️ Removed `$get[removed]` warning(s) from <@$get[target]>.]
$color[248046]
$footer[Chronolith • Moderation]"""
rmw_slash = """$let[removed;0]
$arrayLoad[wids; ;$option[ids]]
$arrayForEach[wids;w;
$let[d;$caseRemove[$guildID;$env[w]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;$ephemeral None of those case IDs exist for that user.]
$interactionReply[
$description[🗑️ Removed `$get[removed]` warning(s) from <@$option[user]>.]
$color[248046]
$footer[Chronolith • Moderation]
]"""
cmd("mod", "removewarning", ["removewarnings", "deletewarning", "deletewarnings", "delwarn", "delwarns"],
    "Remove warnings by their case IDs", rmw_prefix, rmw_slash,
    [{"type": 6, "name": "user", "description": "Target user", "required": True},
     {"type": 3, "name": "ids", "description": "Space-separated case IDs", "required": True}])

cmd("mod", "clearwarns", [], "Clear all warnings from one or more targets",
    """$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found.]
$let[cleared;0]
$arrayLoad[ct;,;$env[tj;ids]]
$arrayForEach[ct;u;
$let[c;$warnsRemove[$guildID;$env[u]]]
$letSum[cleared;$get[c]]
]
$description[🧼 Cleared `$get[cleared]` warning(s).]
$color[248046]
$footer[Chronolith • Moderation]""",
    """$let[c;$warnsRemove[$guildID;$option[users]]]
$interactionReply[
$description[🧼 Cleared `$get[c]` warning(s).]
$color[248046]
$footer[Chronolith • Moderation]
]""",
    [{"type": 3, "name": "users", "description": "Mentions/usernames/IDs", "required": True}])

cmd("mod", "unban", [], "Unban one or more users by ID (trailing words = reason)",
    """$onlyIf[$message[0]!=;Provide one or more user IDs (extra words become the reason).]
$let[ulist;]
$let[reason;]
$arrayLoad[toks; ;$message]
$arrayForEach[toks;t;
$if[$isNumber[$env[t]]==true;
$let[ulist;$get[ulist]$if[$get[ulist]!=;,]$env[t]]
;
$let[reason;$get[reason]$if[$get[reason]!=; ]$env[t]]
]
]
$onlyIf[$get[ulist]!=;Provide one or more user IDs (extra words become the reason).]
$let[reason;$if[$get[reason]==;Unban;$get[reason]]]
$let[ok;0]
$arrayLoad[ids;,;$get[ulist]]
$arrayForEach[ids;u;
$if[$env[u]!=;
$let[r;$punish[unban;$guildID;$authorID;$env[u];;$get[reason]]]
$if[$checkContains[$get[r];⛔]!=true;
$letSum[ok;1]
]
]
]
$title[**__The Ban Hammer retracts.__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[unban]]
$description[• **Action :** `unban`
$if[$checkContains[$get[ulist];,]!=true;
> **Member:** [$username[$get[ulist]]\\](https://discord.com/users/$get[ulist])
;
> **Members:** <@$get[ulist]>
]
> **Reason:** `$get[reason]`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
$thumbnail[$userAvatar[$authorID;128;png]]
$addField[Unbanned;$get[ok];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$get[ulist];,]!=true;
$addActionRow
$addButton[bban-$get[ulist]-$authorID;Ban;Danger]
]""",
    """$let[ok;0]
$arrayLoad[ids; ;$option[ids]]
$arrayForEach[ids;u;
$if[$env[u]!=;
$let[r;$punish[unban;$guildID;$authorID;$env[u];;$if[$option[reason]==;No reason provided;$option[reason]]]]
$if[$checkContains[$get[r];⛔]!=true;
$letSum[ok;1]
]
]
]
$let[ulist;$replace[$option[ids]; ;,]]
$interactionReply[
$title[**__The Ban Hammer retracts.__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[unban]]
$description[• **Action :** `unban`
$if[$checkContains[$get[ulist];,]!=true;
> **Member:** [$username[$get[ulist]]\\](https://discord.com/users/$get[ulist])
;
> **Members:** <@$get[ulist]>
]
> **Reason:** `$if[$option[reason]==;No reason provided;$option[reason]]`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
$thumbnail[$userAvatar[$authorID;128;png]]
$addField[Unbanned;$get[ok];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$get[ulist];,]!=true;
$addActionRow
$addButton[bban-$get[ulist]-$authorID;Ban;Danger]
]
]""",
    [{"type": 3, "name": "ids", "description": "Space-separated user IDs", "required": True},
     {"type": 3, "name": "reason", "description": "Reason", "required": False}])


cmd("channel", "slowmode", [], "Set channel slowmode (seconds, or off)",
    """$let[s;$if[$message[0]==off;0;$message[0]]]
$onlyIf[$and[$get[s]!=,$get[s]>=0,$get[s]<=21600]==true;Usage: slowmode <seconds|off>]
$setChannelSlowmode[$channelID;$get[s]]
$description[🐢 Slowmode in <#$channelID> set to $get[s]s.]""",
    """$let[s;$option[seconds]]
$onlyIf[$and[$get[s]!=,$get[s]>=0,$get[s]<=21600]==true;$ephemeral Pick 0-21600 seconds.]
$setChannelSlowmode[$default[$option[channel];$channelID];$get[s]]
$interactionReply[$description[🐢 Slowmode updated to $get[s]s.]]""",
    [{"type": 4, "name": "seconds", "description": "0 to disable", "required": True},
     {"type": 7, "name": "channel", "description": "Channel (default: here)", "required": False}])

# lockdown per plan: [channels...|"server"] [duration] [reason] — order-independent
LOCK_SPEC = dict(
    folder="channel", name="lock", aliases=["lockdown"],
    desc="Lock channels (or the server) — optional duration and/or reason",
    gate="mod",
    options=[
        {"type": 3, "name": "targets", "description": "Channels, IDs, or 'server' (default: here)", "required": False},
        {"type": 3, "name": "duration", "description": "e.g. 30s, 5m, 2h, 1d", "required": False},
        {"type": 3, "name": "reason", "description": "Reason", "required": False},
    ])
UNLOCK_SPEC = dict(
    folder="channel", name="unlock", aliases=["unlockdown"],
    desc="Unlock channels (or every locked channel with 'server')",
    gate="mod",
    options=[
        {"type": 3, "name": "targets", "description": "Channels, IDs, or 'server' (default: here)", "required": False},
        {"type": 3, "name": "reason", "description": "Reason", "required": False},
    ])

lock_pfx = """$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[dur;]
$let[reason;]
$let[server;0]
$let[chs;]
$arrayLoad[toks; ;$message]
$arrayForEach[toks;w;
$let[cls;reason]
$if[$toLowerCase[$env[w]]==server;
$let[cls;server]
]
$if[$and[$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true,$isNumber[$env[w]]!=true]==true;
$let[cls;dur]
]
$if[$and[$or[$startsWith[$env[w];<#]==true,$isNumber[$env[w]]==true]==true,$get[cls]==reason]==true;
$let[cls;ch]
]
$if[$get[cls]==dur;
$let[dur;$env[w]]
$let[cls;done]
]
$if[$get[cls]==server;
$let[server;1]
$let[cls;done]
]
$if[$get[cls]==ch;
$let[chs;$get[chs]$if[$get[chs]!=;,]$replace[$replace[$env[w];<#;];>;]]
$let[cls;done]
]
$if[$get[cls]==reason;
$let[reason;$get[reason] $env[w]]
]
]
$if[$get[chs]==;
$let[chs;$channelID]
]
$let[until;0]
$if[$get[dur]!=;
$let[until;$math[$getTimestamp+$durationToMs[$get[dur]]]]
]
$let[n;0]
$if[$get[server]==1;
$let[n;$lockAll[$guildID;$if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]];$authorID;$get[until]]]
;
$arrayLoad[cl;,;$get[chs]]
$arrayForEach[cl;c;
$if[$and[$channelExists[$env[c]]==true,$get[server]==0]==true;
$lockChan[$guildID;$env[c];$if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]];$authorID;$get[until]]
$letSum[n;1]
]
]
]
$let[casen;$newCase[$guildID;lock;$botID;$authorID;$if[$get[dur]!=;$get[dur];];Locked $get[n] channel(s): $if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]]]]
$let[ml;$modlogPost[$guildID;$get[casen];lock;$botID;$authorID;$if[$get[dur]!=;$get[dur];];Lockdown of $get[n] channel(s)]]
$description[Locked `$get[n]` channel(s)$if[$get[dur]!=;, auto-unlock in $get[dur]].
> $if[$trim[$get[reason]]==;no reason;$trim[$get[reason]]]]
$color[F23F24]
$footer[Chronolith • Lockdown]"""

def lock_bodies(which):
    fn = "lockAll" if which == "server" else "lockChan"
    tag = "server-wide." if which == "server" else "locked."
    return fn, tag

# register lock with runtime-built bodies
def build_lock():
    from types import SimpleNamespace
    c = dict(LOCK_SPEC)
    pfx = lock_pfx  # durations are baked into lockChan/lockAll by the engine
    slx = """$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[rc;$lockAll[$guildID;$if[$option[reason]==;no reason;$option[reason]];$authorID;0]]
$ephemeral
$interactionReply[
$description[🔒 `$get[rc]` channel(s) locked server-wide.$if[$option[duration]!=; Auto-unlock in **$option[duration]**.]]
$color[F23F24]
$footer[Chronolith • Lockdown]
]"""
    c["prefix"] = pfx
    c["slash"] = slx
    return c

lock_cmd = build_lock()
lock_cmd["prefix"] = _postfix(lock_cmd["prefix"])
lock_cmd["slash"] = _postfix(lock_cmd["slash"])
CMDS.append(lock_cmd)

unlock_pfx = """$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[reason;$if[$message==;no reason;$message]]
$let[server;0]
$let[chs;]
$arrayLoad[toks; ;$message]
$arrayForEach[toks;w;
$if[$toLowerCase[$env[w]]==server;
$let[server;1]
;
$if[$startsWith[$env[w];<#];
$let[chs;$get[chs]$replace[$replace[$env[w];<#;];>;]],
$if[$checkCondition[$env[w] + 0 >= 0]==true;
$let[chs;$get[chs]$if[$get[chs]!=;,]$env[w]]
]
]
]
]
$if[$get[chs]==;
$let[chs;$channelID]
]
$let[n;0]
$if[$get[server]==1;
$let[n;$unlockAll[$guildID]]
;
$arrayLoad[cl;,;$get[chs]]
$arrayForEach[cl;c;
$let[u;$unlockChan[$guildID;$env[c]]]
$if[$get[u]==1;
$letSum[n;1]
]
]
]
$if[$get[n]>0;
$description[**$get[n]** channel(s) unlocked

> $get[reason]]
$color[248046]
;
$description[🔓 No channels were locked.]
$color[#4E5058]
]
$footer[Chronolith • Lockdown]"""
unlock_slx = """$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[n;$unlockAll[$guildID]]
$interactionReply[
$description[🔓 `$get[n]` channel(s) unlocked.]
$color[248046]
$footer[Chronolith • Lockdown]
]"""
CMDS.append(dict(folder="channel", name="unlock", aliases=["unlockdown"],
                 desc="Unlock channels (or every locked channel with 'server')",
                 prefix=_postfix(unlock_pfx), slash=_postfix(unlock_slx), options=UNLOCK_SPEC["options"], gate="mod"))

# =====================================================================
# ---------------------------------------------------------------- cases
# ---------------------------------------------------------------- reports
cmd("reports", "setreportchannel", ["reportchannel"], "Set the channel where user reports are sent",
    """$let[c;$if[$message[0]!=;$replace[$replace[$message[0];<#;];>;];$channelID]]
$onlyIf[$get[c]!=;Usage: setreportchannel <#channel|ID>]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;reports;"$trim[$get[c]]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$author[Chronolith • Reports;$userAvatar[$botID;64;png]]
$description[Report channel set to <#$get[c]>.]
$color[5865F2]
$footer[Chronolith]""",
    """$let[c;$default[$option[channel];]]
$onlyIf[$get[c]!=;$ephemeral Provide a channel.]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;reports;"$trim[$get[c]]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$author[Chronolith • Reports;$userAvatar[$botID;64;png]]
$description[Report channel set to <#$get[c]>.]
$color[5865F2]
$footer[Chronolith]
]""",
    [{"type": 7, "name": "channel", "description": "Report inbox channel", "required": True}])

cmd("reports", "report", [], "Report a user to the moderators (reason required)",
    """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Usage: report <user> <reason>]
$onlyIf[$message[1;999]!=;A reason is required.]
$jsonLoad[rcfg;$getGuildVar[cfg;$guildID;{}]]
$let[ch;$env[rcfg;reports]]
$onlyIf[$get[ch]!=;Reports are not configured here (mods: %setreportchannel).]
$let[id;$reportNew[$guildID;$authorID;$get[target];$message[1;999]]]
$sendMessage[$get[ch];
$author[Report #$get[id];$userAvatar[$authorID;32;png]]
$color[F23F24]
$description[> $message[1;999]]
$addField[Reported user;<@$get[target]>
-# $get[target];true]
$addField[Reported by;<@$authorID>
-# $authorID;true]
$addField[Filed;$discordTimestamp[$getTimestamp;RelativeTime];true]
$addField[Context;-# $hyperlink[jump to message;$messageLink[$channelID;$messageID]] in <#$channelID>;true]
$footer[Chronolith • Reports • %claim $get[id] to take it]
;false]
$description[✅ Report **#$get[id]** filed.]
$deleteIn[10s]""",
    """$onlyIf[$option[reason]!=;$ephemeral A reason is required.]
$jsonLoad[rcfg;$getGuildVar[cfg;$guildID;{}]]
$let[ch;$env[rcfg;reports]]
$if[$get[ch]==;
$ephemeral
$interactionReply[Reports are not configured here.]
$stop
]
$let[id;$reportNew[$guildID;$authorID;$option[user];$option[reason]]]
$sendMessage[$get[ch];
$author[Report #$get[id];$userAvatar[$authorID;32;png]]
$color[F23F24]
$description[> $option[reason]]
$addField[Reported user;<@$option[user]>
-# $option[user];true]
$addField[Reported by;<@$authorID>
-# $authorID;true]
$addField[Filed;$discordTimestamp[$getTimestamp;RelativeTime];true]
$footer[Chronolith • Reports]
;false]
$interactionReply[$ephemeral ✅ Report **#$get[id]** filed.]""",
    [{"type": 6, "name": "user", "description": "User to report", "required": True},
     {"type": 3, "name": "reason", "description": "What happened", "required": True}], gate="open")

cmd("reports", "reports", ["reportlist"], "List reports by status, or view one by ID",
    """$let[q;$if[$message[0]!=;$toLowerCase[$message[0]];open]]
$onlyIf[$or[$get[q]==open,$or[$get[q]==claimed,$or[$get[q]==resolved,$or[$get[q]==dismissed,$or[$get[q]==all,$checkCondition[$get[q] + 0 >= 0]]]]]]==true;Usage: reports \[open|claimed|resolved|dismissed|all\] or reports <id>]
$let[allr;$reportAll[$guildID]]
$onlyIf[$get[allr]!=;No reports on record.]
$if[$checkCondition[$get[q] + 0 >= 0]==true;
$let[raw;$reportGet[$guildID;$get[q]]]
$onlyIf[$get[raw]!=;Report not found.]
$!jsonLoad[r;$get[raw]]
$author[🚩 Report #$get[q] • $toUpperCase[$env[r;st]];$userAvatar[$botID;64;png]]
$color[$if[$env[r;st]==open;F0B232;$if[$env[r;st]==claimed;5865F2;248046]]]
$description[> $env[r;rsn]]
$addField[Reported user;<@$env[r;tgt]>;true]
$addField[Reporter;<@$env[r;rep]>;true]
$addField[Filed;$discordTimestamp[$env[r;ts];RelativeTime];true]
$if[$env[r;claimed]!=;
$addField[Claimed by;<@$env[r;claimed]>;true]
]
$if[$env[r;note]!=;
$addField[Resolution note;$env[r;note];false]
]
$footer[Chronolith • Reports]
$stop
]
$arrayLoad[rids;,;$get[allr]]
$arrayLoad[lines;]
$arrayForEach[rids;id;
$let[raw;$reportGet[$guildID;$env[id]]]
$!jsonLoad[r;$get[raw]]
$if[$or[$get[q]==all,$env[r;st]==$get[q]]==true;
$arrayPush[lines;-# **$env[id]** · $toUpperCase[$env[r;st]] · <@$env[r;tgt]> · $env[r;rsn]]
]
]
$if[$arrayLength[lines]==0;
$description[No $get[q] reports.]
$stop
]
$if[$arrayLength[lines]>10;
$arraySlice[lines;lines;$math[$arrayLength[lines]-10];$arrayLength[lines]]]
$author[Reports • $get[q];$userAvatar[$botID;64;png]]
$color[5865F2]
$description[$arrayJoin[lines;
]]
$footer[Chronolith • newest 10 shown]""",
    """$ephemeral
$interactionReply[
$description[Use the prefix command: %reports \[open|claimed|resolved|dismissed|all|<id>\]]
$color[5865F2]
]""")

def lifecycle_cmd(name, status, desc, note_optional=True):
    pfx = """$onlyIf[$message[0]!=;Usage: """ + name + """ <id>""" + (" \\[note\\]" if note_optional else "") + """]
$let[r;$reportUpdate[$guildID;$message[0];""" + status + """;$authorID;$message[1;999]]]
$onlyIf[$get[r]==1;Report not found.]
$onlyIf[$get[r]!=-1;Invalid transition for that report.]
$description[✅ Report #$message[0] marked **""" + status + """**.]
$color[248046]
$footer[Chronolith • Reports]"""
    slx = """$let[r;$reportUpdate[$guildID;$option[id];""" + status + """;$authorID;$option[note]]]
$onlyIf[$get[r]==1;$ephemeral Report not found.]
$onlyIf[$get[r]!=-1;$ephemeral Invalid transition.]
$interactionReply[
$description[✅ Report #$option[id] marked **""" + status + """**.]
$color[248046]
]"""
    opts = [{"type": 4, "name": "id", "description": "Report ID", "required": True}]
    if note_optional:
        opts.append({"type": 3, "name": "note", "description": "Resolution note", "required": False})
    cmd("reports", name, [], desc, pfx, slx, opts)

lifecycle_cmd("claim", "claimed", "Claim an open report")
lifecycle_cmd("close", "resolved", "Close/resolve a report (optionally with a note)")
lifecycle_cmd("dismiss", "dismissed", "Dismiss a report")

cmd("reports", "archivereport", ["rarchive"], "Delete a report record entirely",
    """$onlyIf[$message[0]!=;Usage: archivereport <id>]
$let[r;$reportArchive[$guildID;$message[0]]]
$onlyIf[$get[r]==1;Report not found.]
$description[📦 Report #$message[0] archived (record deleted).]
$color[#4E5058]
$footer[Chronolith • Reports]""",
    """$let[r;$reportArchive[$guildID;$option[id]]]
$onlyIf[$get[r]==1;$ephemeral Report not found.]
$interactionReply[
$description[📦 Report #$option[id] archived.]
$color[#4E5058]
]""",
    [{"type": 4, "name": "id", "description": "Report ID", "required": True}])

# ---------------------------------------------------------------- purge family
purge_pfx = """$onlyIf[$hasPerms[$guildID;$botID;ManageMessages]==true;⛔ I am missing the Manage Messages permission.]
$let[arg1;$if[$message[0]!=;$message[0];all]]
$let[mode;$if[$checkCondition[$get[arg1] + 0 >= 0]==true;all;$toLowerCase[$get[arg1]]]]
$onlyIf[$or[$get[mode]==all,$or[$get[mode]==bot,$or[$get[mode]==contains,$or[$get[mode]==embeds,$or[$get[mode]==emoji,$or[$get[mode]==files,$or[$get[mode]==images,$or[$get[mode]==links,$or[$get[mode]==mentions,$or[$get[mode]==pings,$or[$get[mode]==human,$get[mode]==reactions]]]]]]]]]]]==true;Usage: purge \\[all\\|bot\\|contains\\|embeds\\|emoji\\|files\\|images\\|links\\|mentions\\|human\\|reactions\\] [search=100] [...]]
$let[search;$if[$checkCondition[$get[arg1] + 0 >= 0]==true;$get[arg1];100]]
$let[extra;$trim[$message[1;999]]]
$let[scan;$scanMessages[$channelID;$if[$get[search]>500;500;$get[search]]]]
$onlyIf[$checkContains[$get[scan];\\[;1]==true;Scan failed — cannot read this channel's history.]
$!jsonLoad[found;$get[scan]]
$let[ids;]
$let[count;0]
$arrayForEach[found;m;
$if[$and[$env[m;p]!=true,$math[$arrayLength[$arrayLoad[cur;,;$get[ids]]]]<100]==true;
$let[match;0]
$if[$get[mode]==all;
$if[$env[m;a]==$authorID;
$let[match;1]
]
]
$if[$get[mode]==human;
$if[$env[m;b]!=true;
$let[match;1]
]
]
$if[$get[mode]==bot;
$if[$env[m;b]==true;
$if[$get[extra]==;
$let[match;1]
;
$if[$startsWith[$env[m;c];$get[extra]]==true;
$let[match;1]
]
]
]
]
$if[$get[mode]==contains;
$if[$checkContains[$toLowerCase[$env[m;c]];$toLowerCase[$get[extra]]]==true;
$let[match;1]
]
]
$if[$get[mode]==embeds;
$if[$env[m;e]>0;
$let[match;1]
]
]
$if[$get[mode]==emoji;
$if[$checkContains[$env[m;c];<:]==true;
$let[match;1]
]
]
$if[$get[mode]==files;
$if[$env[m;t]>0;
$let[match;1]
]
]
$if[$get[mode]==images;
$if[$or[$env[m;t]>0,$env[m;e]>0]==true;
$let[match;1]
]
]
$if[$get[mode]==links;
$if[$checkContains[$toLowerCase[$env[m;c]];http]==true;
$let[match;1]
]
]
$if[$or[$get[mode]==mentions,$get[mode]==pings]==true;
$if[$env[m;n]>0;
$let[match;1]
]
]
$if[$get[match]==1;
$let[ids;$get[ids]$if[$get[ids]!=;,]$env[m;i]]
$letSum[count;1]
]
]
]
$if[$get[mode]==reactions;
$arrayForEach[found;m;
$deleteAllMessageReactions[$channelID;$env[m;i]]
]
Reactions cleared in the last $get[search] messages.;
$if[$get[count]>0;
$let[del;$deleteMessage[$channelID;$replace[$get[ids];,;]]]
🧹 Purged `$get[del]` message(s) — `$get[mode]` mode.;
🧹 Nothing matched the `$get[mode]` filter in the last $get[search] messages.
]
]
$footer[Chronolith • Purge]
$color[5865F2]"""

purge_slash = """$onlyIf[$hasPerms[$guildID;$botID;ManageMessages]==true;$ephemeral I am missing the Manage Messages permission.]
$let[scan;$scanMessages[$channelID;$if[$option[search]>500;500;$option[search]]]]
$!jsonLoad[found;$get[scan]]
$interactionReply[$ephemeral 🧹 Purge queued — `$option[mode]` mode.]"""

cmd("channel", "purge", ["clean"], "Purge messages with filters (pinned are ignored)",
    purge_pfx, purge_slash,
    [{"type": 3, "name": "mode", "description": "all, bot, contains, embeds, emoji, files, images, links, mentions, human, reactions", "required": False},
     {"type": 4, "name": "search", "description": "How many to scan (default 100)", "required": False},
     {"type": 3, "name": "extra", "description": "substring / prefix", "required": False}])

cmd("channel", "cleanup", [], "Purge the bot's own messages (pinned included)",
    """$onlyIf[$hasPerms[$guildID;$botID;ManageMessages]==true;⛔ I am missing the Manage Messages permission.]
$let[scan;$scanMessages[$channelID;$if[$checkCondition[$if[$message[0]!=;$message[0];100] + 0 > 500]==true;500;$if[$message[0]!=;$message[0];100]]]]
$onlyIf[$checkContains[$get[scan];\\[;1]==true;Scan failed — cannot read this channel's history.]
$!jsonLoad[found;$get[scan]]
$let[ids;]
$let[count;0]
$arrayForEach[found;m;
$if[$and[$env[m;a]==$botID,$math[$arrayLength[$arrayLoad[cur;,;$get[ids]]]]<100]==true;
$let[ids;$get[ids]$if[$get[ids]!=;,]$env[m;i]]
$letSum[count;1]
]
]
$if[$get[count]>0;
$let[del;$deleteMessage[$channelID;$get[ids]]]
🧹 Cleaned `$get[del]` of my messages (pinned included).;
🧹 Nothing to clean.
]
$footer[Chronolith • Cleanup]
$color[5865F2]""",
    """$let[scan;$scanMessages[$channelID;$default[$option[search];100]]]
$!jsonLoad[found;$get[scan]]
$interactionReply[$ephemeral 🧹 Cleanup queued.]""",
    [{"type": 4, "name": "search", "description": "How many to scan (default 100)", "required": False}])

cmd("cases", "case", [], "Inspect a case by number",
    """$onlyIf[$message[0]!=;Usage: case <number>]
$let[raw;$caseGet[$guildID;$message[0]]]
$onlyIf[$get[raw]!=;Case not found.]
$jsonLoad[c;$get[raw]]
$description[Case #$message[0] — $toUpperCase[$env[c;t]]]
$color[5865F2]
$addField[User;<@$env[c;u]>;true]
$addField[Moderator;<@$env[c;m]>;true]
$addField[Duration;$if[$env[c;d]==;n/a;$env[c;d]];true]
$addField[Reason;$env[c;r];false]
$addField[When;$discordTimestamp[$env[c;ts];RelativeTime];true]""",
    """$let[raw;$caseGet[$guildID;$option[number]]]
$if[$get[raw]==;
$ephemeral
$interactionReply[Case not found.]
$stop
]
$jsonLoad[c;$get[raw]]
$interactionReply[
$description[Case #$option[number] — $toUpperCase[$env[c;t]]]
$color[5865F2]
$addField[User;<@$env[c;u]>;true]
$addField[Moderator;<@$env[c;m]>;true]
$addField[Duration;$if[$env[c;d]==;n/a;$env[c;d]];true]
$addField[Reason;$env[c;r];false]
$addField[When;$discordTimestamp[$env[c;ts];RelativeTime];true]
]""",
    [{"type": 4, "name": "number", "description": "Case number", "required": True}])

cmd("cases", "cases", ["history"], "A user's full case history (10 per page)",
    """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$arrayLoad[cs;,;$get[uc]]
$arrayLoad[out;]
$arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$return[-# **#$env[k]** $actionEmoji[$env[one;t]] · $env[one;r]];out]
$author[History • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[5865F2]
$thumbnail[$userAvatar[$get[target];256;png]]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[cs] case(s)]""",
    """$let[uc;$userCases[$guildID;$option[user]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$arrayLoad[cs;,;$get[uc]]
$if[$arrayLength[cs]==0;
$ephemeral
$interactionReply[No cases on record for that user.]
$stop
]
$arrayLoad[cs;,;$get[uc]]
$arrayLoad[out;]
$arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$return[-# **#$env[k]** $actionEmoji[$env[one;t]] · $env[one;r]];out]
$interactionReply[
$author[History • $userTag[$option[user]];$userAvatar[$option[user];64;png]]
$color[5865F2]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[cs] case(s)]
]""",
    [{"type": 6, "name": "user", "description": "User", "required": True}])

cmd("cases", "reason", [], "Edit a case's reason",
    """$onlyIf[$message[0]!=;Usage: reason <case#> <new reason>]
$onlyIf[$message[1;999]!=;Provide the new reason.]
$let[r;$caseEditReason[$guildID;$message[0];$message[1;999]]]
$if[$get[r]==error;
⛔ Case not found.;
✅ Reason updated for case #$message[0].
]""",
    """$onlyIf[$option[reason]!=;$ephemeral Provide the new reason.]
$let[r;$caseEditReason[$guildID;$option[number];$option[reason]]]
$if[$get[r]==error;
$ephemeral
$interactionReply[⛔ Case not found.]
$stop
]
$interactionReply[✅ Reason updated for case #$option[number].]""",
    [{"type": 4, "name": "number", "description": "Case number", "required": True},
     {"type": 3, "name": "reason", "description": "New reason", "required": True}])

# ---------------------------------------------------------------- automod
cmd("automod", "automod", [], "Toggle automod modules (invites, mentions, caps — the word list is active whenever it is non-empty)",
    """$onlyIf[$message[0]!=;Usage: automod <invites|links|words|mentions|caps|spam> <on|off>]
$let[mod2;$toLowerCase[$message[0]]]
$let[val;$toLowerCase[$message[1]]]
$onlyIf[$and[$or[$get[mod2]==invites,$or[$get[mod2]==links,$or[$get[mod2]==mentions,$or[$get[mod2]==caps,$get[mod2]==spam]]]]==true,$or[$get[val]==on,$get[val]==off]==true]==true;Usage: automod <module> <on|off>]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$if[$get[mod2]==invites;$jsonSet[cfg;automod;invites;$if[$get[val]==on;true;false]]]
$if[$get[mod2]==links;
$jsonSet[cfg;automod;links;$if[$get[val]==on;true;false]]]
$if[$get[mod2]==mentions;
$jsonSet[cfg;automod;mentionLimit;$if[$get[val]==on;6;]]
]
$if[$get[mod2]==caps;
$jsonSet[cfg;automod;caps;$if[$get[val]==on;true;false]]
$jsonSet[cfg;automod;capsMin;$if[$get[val]==on;12;]]
]
$if[$get[mod2]==spam;
$jsonSet[cfg;automod;spam;$if[$get[val]==on;true;false]]
$jsonSet[cfg;automod;spamN;5]
$jsonSet[cfg;automod;spamS;5]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Automod module **$get[mod2]** is now **$get[val]**.]
$color[F0B232]
$footer[Chronolith • Automod]""",
    """$let[m;$option[module]]
$let[val;$option[state]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$if[$get[m]==invites;$jsonSet[cfg;automod;invites;$if[$get[val]==on;true;false]]]
$if[$get[m]==links;
$jsonSet[cfg;automod;links;$if[$get[val]==on;true;false]]]
$if[$get[m]==mentions;
$jsonSet[cfg;automod;mentionLimit;$if[$get[val]==on;6;]]
]
$if[$get[m]==caps;
$jsonSet[cfg;automod;caps;$if[$get[val]==on;true;false]]
$jsonSet[cfg;automod;capsMin;$if[$get[val]==on;12;]]
]
$if[$get[m]==spam;
$jsonSet[cfg;automod;spam;$if[$get[val]==on;true;false]]
$jsonSet[cfg;automod;spamN;5]
$jsonSet[cfg;automod;spamS;5]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$description[🛡️ Automod module **$get[m]** is now **$get[val]**.]
$color[F0B232]
$footer[Chronolith • Automod]
]""",
    [{"type": 3, "name": "module", "description": "invites, links, mentions, caps or spam", "required": True},
     {"type": 3, "name": "state", "description": "on or off", "required": True}])

cmd("automod", "wordadd", [], "Add a banned word (substring match, case-insensitive)",
    """$onlyIf[$message[0]!=;Usage: wordadd <word>]
$let[w;$toLowerCase[$message[0]]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$let[words;$env[cfg;automod;words]]
$arrayLoad[ws;,;$get[words]]
$if[$arraySome[ws;x;$checkCondition[$env[x]==$get[w]]]!=true;
$arrayPush[ws;$get[w]]
$jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Word added ($arrayLength[ws] total).];
$description[That word is already on the list.]
]""",
    """$let[w;$toLowerCase[$option[word]]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[ws;,;$env[cfg;automod;words]]
$if[$arraySome[ws;x;$checkCondition[$env[x]==$get[w]]]!=true;
$arrayPush[ws;$get[w]]
$jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[🛡️ Word added ($arrayLength[ws] total).]];
$interactionReply[That word is already on the list.]
]""",
    [{"type": 3, "name": "word", "description": "Word to ban", "required": True}])

cmd("automod", "worddel", [], "Remove a banned word",
    """$onlyIf[$message[0]!=;Usage: worddel <word>]
$let[w;$toLowerCase[$message[0]]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[ws;,;$env[cfg;automod;words]]
$let[i;$arrayIndexOf[ws;$get[w]]]
$if[$get[i]==-1;
$description[That word is not on the list.];
$arraySplice[ws;$get[i];1]
$jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Word removed ($arrayLength[ws] left).]
]""",
    """$let[w;$toLowerCase[$option[word]]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[ws;,;$env[cfg;automod;words]]
$let[i;$arrayIndexOf[ws;$get[w]]]
$if[$get[i]==-1;
$interactionReply[That word is not on the list.];
$arraySplice[ws;$get[i];1]
$jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[🛡️ Word removed ($arrayLength[ws] left).]]
]""",
    [{"type": 3, "name": "word", "description": "Word to remove", "required": True}])

cmd("automod", "words", ["wordlist"], "List banned words",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$let[words;$env[cfg;automod;words]]
$if[$get[words]==;
$description[No banned words configured.];
$description[Banned words]
$addField[Words;$get[words];false]
]""",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$interactionReply[$if[$env[cfg;automod;words]==;No banned words configured.;Banned words: $env[cfg;automod;words]]]""")

cmd("automod", "joingate", [], "Configure anti-raid join gate",
    """$onlyIf[$message[0]!=;Usage: joingate <minAgeDays> <joins> <windowSec> \[lockdown\]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;joingate;minAgeDays;$message[0]]
$jsonSet[cfg;joingate;joins;$message[1]]
$jsonSet[cfg;joingate;window;$message[2]]
$jsonSet[cfg;joingate;action;$if[$message[3]!=;$message[3];alert]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🚪 Join gate: accounts under $message[0] days kicked; $message[1] joins / $message[2]s triggers $if[$message[3]!=;$message[3];alert].]""",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;joingate;minAgeDays;$option[minagedays]]
$jsonSet[cfg;joingate;joins;$option[joins]]
$jsonSet[cfg;joingate;window;$option[window]]
$jsonSet[cfg;joingate;action;$if[$option[action]!=;$option[action];alert]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[🚪 Join gate configured.]]""",
    [{"type": 4, "name": "minagedays", "description": "Min account age in days (0 = off)", "required": True},
     {"type": 4, "name": "joins", "description": "Joins before raid alert", "required": True},
     {"type": 4, "name": "window", "description": "Window in seconds", "required": True},
     {"type": 3, "name": "action", "description": "alert or lockdown", "required": False}])

# ---------------------------------------------------------------- config
cmd("config", "config", ["settings"], "Show Chronolith settings for this server",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$author[Chronolith • Settings;$userAvatar[$botID;64;png]]
$color[5865F2]
$addField[Modlog;$if[$env[cfg;modlog]==;*not set*;<#$env[cfg;modlog]>];true]
$addField[Mod roles;$if[$env[cfg;modroles]==;*ManageServer by default*;<@&$replace[$env[cfg;modroles];,;>, <@&>]>];true]
$addField[Muterole;$if[$env[cfg;muterole]==;*timeouts*;<@&$env[cfg;muterole]>];true]
$addField[Autorole;$if[$env[cfg;autorole]==;*off*;<@&$env[cfg;autorole]>];true]
$addField[Quarantine role;$if[$env[cfg;qrole]==;*timeouts only*;<@&$env[cfg;qrole]>];true]
$addField[Warn escalation;$if[$env[cfg;warns;threshold]==;*off*;$env[cfg;warns;threshold] warns → $env[cfg;warns;action]];true]
$addField[Anti-nuke;$if[$env[cfg;antinuke;on]==true;ON — $if[$env[cfg;antinuke;threshold]!=;$env[cfg;antinuke;threshold];3] actions → $if[$env[cfg;antinuke;action]!=;$env[cfg;antinuke;action];ban];*off*];true]
$addField[Verification;$if[$env[cfg;verify;role]!=;ON — <@&$env[cfg;verify;role]>;*off*];true]
$addField[Automod;invites $if[$env[cfg;automod;invites]==true;**on**;off] · links $if[$env[cfg;automod;links]==true;**on**;off] · spam $if[$env[cfg;automod;spam]==true;**on**;off] · caps $if[$env[cfg;automod;caps]==true;**on**;off] · mentions $if[$env[cfg;automod;mentionLimit]==;off;>$env[cfg;automod;mentionLimit]];false]
$addField[Join gate;$if[$env[cfg;joingate;joins]==;*off*;$env[cfg;joingate;joins] joins / $env[cfg;joingate;window]s · min age $env[cfg;joingate;minAgeDays]d];false]
$footer[Chronolith • %quicksetup applies sane defaults]""",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$ephemeral
$interactionReply[
$author[Chronolith • Settings;$userAvatar[$botID;64;png]]
$color[5865F2]
$addField[Modlog;$if[$env[cfg;modlog]==;*not set*;<#$env[cfg;modlog]>];true]
$addField[Mod roles;$if[$env[cfg;modroles]==;*ManageServer by default*;<@&$replace[$env[cfg;modroles];,;>, <@&>]>];true]
$addField[Warn escalation;$if[$env[cfg;warns;threshold]==;*off*;$env[cfg;warns;threshold] warns → $env[cfg;warns;action]];true]
$addField[Anti-nuke;$if[$env[cfg;antinuke;on]==true;ON;*off*];true]
$addField[Automod;invites $if[$env[cfg;automod;invites]==true;**on**;off] · spam $if[$env[cfg;automod;spam]==true;**on**;off];false]
$footer[Chronolith]
]""")

cmd("config", "modrole", [], "Add or remove a moderator role",
    """$onlyIf[$message[0]!=;Usage: modrole add|remove <role>]
$let[mode;$toLowerCase[$message[0]]]
$onlyIf[$or[$get[mode]==add,$get[mode]==remove]==true;Usage: modrole add|remove <role>]
$let[r;""" + ROLE_STRIP.replace("$message[0]", "$message[1]") + """]
$onlyIf[$get[r]!=;Mention the role.]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[rs;,;$env[cfg;modroles]]
$if[$get[mode]==add;
$if[$arraySome[rs;x;$checkCondition[$env[x]==$get[r]]]!=true;
$arrayPush[rs;$get[r]]
$jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ <@&$get[r]> is now a mod role.];
$description[Already a mod role.]
];
$let[i;$arrayIndexOf[rs;$get[r]]]
$if[$get[i]==-1;
$description[Not a mod role.];
$arraySplice[rs;$get[i];1]
$jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ <@&$get[r]> removed from mod roles.]
]
]""",
    """$let[r;$option[role]]
$let[mode;$option[mode]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[rs;,;$env[cfg;modroles]]
$if[$get[mode]==add;
$if[$arraySome[rs;x;$checkCondition[$env[x]==$get[r]]]!=true;
$arrayPush[rs;$get[r]]
$jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ <@&$get[r]> is now a mod role.]];
$interactionReply[Already a mod role.]
];
$let[i;$arrayIndexOf[rs;$get[r]]]
$if[$get[i]==-1;
$interactionReply[Not a mod role.];
$arraySplice[rs;$get[i];1]
$jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ <@&$get[r]> removed from mod roles.]]
]
]""",
    [{"type": 3, "name": "mode", "description": "add or remove", "required": True},
     {"type": 8, "name": "role", "description": "Role", "required": True}])

cmd("config", "muterole", [], "Use a role for mutes instead of timeouts",
    """$if[$message[0]==off;
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;muterole;]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Mutes now use timeouts.;
$let[r;""" + ROLE_STRIP + """]
$onlyIf[$get[r]!=;Usage: muterole <role|off>]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;muterole;"$get[r]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Mutes now use <@&$get[r]>.
]""",
    """$let[r;$default[$option[role];]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;muterole;"$get[r]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[r]==;Mutes now use timeouts.;✅ Mutes now use <@&$get[r]>.]]""",
    [{"type": 8, "name": "role", "description": "Role (omit for timeouts)", "required": False}])

cmd("config", "warnset", [], "Configure warn escalation",
    """$onlyIf[$message[0]!=;Usage: warnset <threshold> <mute|kick|ban|none> \[duration\]]
$onlyIf[$or[$toLowerCase[$message[1]]==none,$or[$toLowerCase[$message[1]]==mute,$or[$toLowerCase[$message[1]]==kick,$toLowerCase[$message[1]]==ban]]]==true;Action must be mute, kick, ban or none.]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;warns;threshold;$message[0]]
$jsonSet[cfg;warns;action;$toLowerCase[$message[1]]]
$jsonSet[cfg;warns;duration;$if[$message[2]!=;$message[2];1h]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[⚠️ Escalation: $message[0] warns → $toLowerCase[$message[1]]$if[$toLowerCase[$message[1]]==mute; for $if[$message[2]!=;$message[2];1h]].]""",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;warns;threshold;$option[threshold]]
$jsonSet[cfg;warns;action;$option[action]]
$jsonSet[cfg;warns;duration;$if[$option[duration]!=;$option[duration];1h]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[⚠️ Escalation configured.]]""",
    [{"type": 4, "name": "threshold", "description": "Warns before action", "required": True},
     {"type": 3, "name": "action", "description": "mute, kick, ban or none", "required": True},
     {"type": 3, "name": "duration", "description": "For mute (e.g. 1h)", "required": False}])

cmd("config", "autorole", [], "Role to give on join",
    """$if[$message[0]==off;
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;autorole;]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Autorole disabled.;
$let[r;""" + ROLE_STRIP + """]
$onlyIf[$get[r]!=;Usage: autorole <role|off>]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;autorole;"$get[r]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Autorole set to <@&$get[r]>.
]""",
    """$let[r;$default[$option[role];]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;autorole;"$get[r]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[r]==;Autorole disabled.;✅ Autorole set to <@&$get[r]>.]]""",
    [{"type": 8, "name": "role", "description": "Role (omit to disable)", "required": False}])

cmd("config", "logs", [], "Set log channels (joinleave, serverlogs)",
    """$onlyIf[$message[0]!=;Usage: logs <joinleave|serverlogs> <#channel|off>]
$onlyIf[$or[$message[0]==joinleave,$message[0]==serverlogs]==true;Kind must be joinleave or serverlogs.]
$let[c;$if[$message[1]==off;;""" + CH_STRIP.replace("$message[0]", "$message[1]") + """ ]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;logs;$message[0];$get[c]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[📋 $message[0] log $if[$get[c]==;disabled;set to <#$get[c]>.]]""",
    """$let[c;$default[$option[channel];]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;logs;$option[kind];$get[c]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[📋 $option[kind] log updated.]]""",
    [{"type": 3, "name": "kind", "description": "joinleave or serverlogs", "required": True},
     {"type": 7, "name": "channel", "description": "Channel (omit to disable)", "required": False}])

cmd("config", "tickets", [], "Set the category new tickets are created under",
    """$if[$message[0]==off;
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;tickets;]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Tickets disabled.;
$let[c;""" + CH_STRIP + """]
$onlyIf[$get[c]!=;Usage: tickets <#category|off>]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;tickets;"$get[c]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Tickets will open under <#$get[c]>.
]""",
    """$let[c;$default[$option[channel];]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;tickets;"$get[c]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[c]==;Tickets disabled.;✅ Tickets will open under <#$get[c]>.]]""",
    [{"type": 7, "name": "channel", "description": "Category channel (omit to disable)", "required": False}])

# ---------------------------------------------------------------- core / info
cmd("core", "help", [], "Command guide (button-paginated)",
    """$author[Chronolith;$userAvatar[$botID;32;png]]
$description[$helpPage[0]]
$color[5865F2]
$thumbnail[$userAvatar[$botID;128;png]]
$footer[Chronolith • Page 1 of $helpPages]
$addActionRow
$addButton[help--1-$authorID;◀;Primary]
$addButton[help-1-$authorID;▶;Primary]""",
    """$interactionReply[
$author[Chronolith;$userAvatar[$botID;32;png]]
$description[$helpPage[0]]
$color[5865F2]
$thumbnail[$userAvatar[$botID;128;png]]
$footer[Chronolith • Page 1 of $helpPages]
$addActionRow
$addButton[help--1-$authorID;◀;Primary]
$addButton[help-1-$authorID;▶;Primary]
]""", gate="open")

cmd("core", "ping", [], "Latency and stats",
    """$author[Chronolith;$userAvatar[$botID;32;png]]
$color[5865F2]
$description[**Gateway** $ping ms
**Uptime** $parseMS[$uptime]
**Servers** $guildCount]
$footer[Chronolith]""",
    """$interactionReply[
$author[Chronolith;$userAvatar[$botID;32;png]]
$color[5865F2]
$description[**Gateway** $ping ms
**Uptime** $parseMS[$uptime]
**Servers** $guildCount]
$footer[Chronolith]
]""", gate="open")

cmd("info", "userinfo", ["whois"], "User profile and mod-relevant stats",
    """$let[target;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$author[$userTag[$get[target]];$userAvatar[$get[target];32;png]]
$color[5865F2]
$thumbnail[$userAvatar[$get[target];128;png]]
$description[-# $get[target]]
$addField[Created;$discordTimestamp[$userCreatedAt[$get[target]];RelativeTime];true]
$if[$memberExists[$guildID;$get[target]]==true;
$addField[Joined;$discordTimestamp[$memberJoinedAt[$guildID;$get[target]];RelativeTime];true]
$addField[Roles;$math[$arrayLength[$arrayLoad[rs;,;$memberRoles[$guildID;$get[target];,]]]];true]
$addField[Warnings;\`$warnCount[$guildID;$get[target]]\`;true]
$if[$userBanner[$get[target]]!=;
$image[$userBanner[$get[target];1024;png]]
]
]
$footer[Chronolith]""",
    """$let[target;$default[$option[user];$authorID]]
$interactionReply[
$author[$userTag[$get[target]];$userAvatar[$get[target];32;png]]
$color[5865F2]
$thumbnail[$userAvatar[$get[target];128;png]]
$description[-# $get[target]]
$addField[Created;$discordTimestamp[$userCreatedAt[$get[target]];RelativeTime];true]
$if[$memberExists[$guildID;$get[target]]==true;
$addField[Joined;$discordTimestamp[$memberJoinedAt[$guildID;$get[target]];RelativeTime];true]
$addField[Warnings;\`$warnCount[$guildID;$get[target]]\`;true]
$if[$userBanner[$get[target]]!=;
$image[$userBanner[$get[target];1024;png]]
]
]
$footer[Chronolith]
]""",
    [{"type": 6, "name": "user", "description": "User (default: you)", "required": False}], gate="open")

cmd("info", "serverinfo", ["guildinfo"], "Server overview",
    """$description[$guildName[$guildID]]
$color[5865F2]
$addField[Owner;<@$guildOwnerID>;true]
$addField[Members;$guildMemberCount[$guildID];true]
$addField[Channels;$arrayLength[$arrayLoad[chs;,;$channelIDs]];true]
$addField[Created;$discordTimestamp[$guildCreatedAt;RelativeTime];true]
$thumbnail[$guildIcon[$guildID;256;png]]""",
    """$interactionReply[
$description[$guildName[$guildID]]
$color[5865F2]
$addField[Owner;<@$guildOwnerID>;true]
$addField[Members;$guildMemberCount[$guildID];true]
$addField[Created;$discordTimestamp[$guildCreatedAt;RelativeTime];true]
$thumbnail[$guildIcon[$guildID;256;png]]
]""", gate="open")

cmd("info", "roleinfo", [], "Role details",
    """$let[r;""" + ROLE_STRIP + """]
$onlyIf[$get[r]!=;Usage: roleinfo <role>]
$description[@$roleName[$guildID;$get[r]]]
$color[5865F2]
$addField[ID;$get[r];true]
$addField[Position;$rolePosition[$guildID;$get[r];true] of $roleCount[$guildID];true]
$addField[Mention;<@&$get[r]>;true]""",
    """$interactionReply[
$description[@$roleName[$guildID;$option[role]]]
$color[5865F2]
$addField[ID;$option[role];true]
$addField[Position;$rolePosition[$guildID;$option[role];true];true]
$addField[Mention;<@&$option[role]>;true]
]""",
    [{"type": 8, "name": "role", "description": "Role", "required": True}], gate="open")

cmd("info", "avatar", ["pfp"], "A user's avatar, full size",
    """$let[target;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$description[$userTag[$get[target]]'s avatar]
$image[$userAvatar[$get[target];1024;png]]""",
    """$let[target;$default[$option[user];$authorID]]
$interactionReply[
$description[$userTag[$get[target]]'s avatar]
$image[$userAvatar[$get[target];1024;png]]
]""",
    [{"type": 6, "name": "user", "description": "User (default: you)", "required": False}], gate="open")

cmd("info", "inrole", [], "List members holding a role",
    """$let[r;""" + ROLE_STRIP + """]
$onlyIf[$get[r]!=;Usage: inrole <role>]
$let[ids;$roleMembers[$guildID;$get[r];, <@>]]
$if[$replace[$get[ids]; ;]==;
$description[Nobody holds that role.];
$description[Members with that role]
$addField[Count;$arrayLength[$arrayLoad[rm;,;$roleMembers[$guildID;$get[r];,]]];true]
$addField[Members;<@$get[ids]>;false]
]""",
    """$let[ids;$roleMembers[$guildID;$option[role];, <@>]]
$interactionReply[$if[$replace[$get[ids]; ;]==;Nobody holds that role.;<@$get[ids]>]]""",
    [{"type": 8, "name": "role", "description": "Role", "required": True}], gate="open")

# ---------------------------------------------------------------- misc
cmd("misc", "snipe", [], "Recover a deleted message (mods only)",
    """$let[i;$default[$message[0];0]]
$let[e;$snipeGet[$guildID;$channelID;snipe;$get[i]]]
$onlyIf[$get[e]!=;Nothing to snipe in this channel.]
$jsonLoad[e;$get[e]]
$description[$if[$env[e;c]==;*(empty message)*;$env[e;c]]]
$addField[Author;<@$env[e;a]>;true]
$addField[Deleted;$discordTimestamp[$env[e;t];RelativeTime];true]
$color[#4E5058]""",
    """$let[i;$default[$option[index];0]]
$let[e;$snipeGet[$guildID;$channelID;snipe;$get[i]]]
$if[$get[e]==;
$ephemeral
$interactionReply[Nothing to snipe in this channel.]
$stop
]
$jsonLoad[e;$get[e]]
$interactionReply[
$description[$if[$env[e;c]==;*(empty message)*;$env[e;c]]]
$addField[Author;<@$env[e;a]>;true]
$addField[Deleted;$discordTimestamp[$env[e;t];RelativeTime];true]
$color[#4E5058]
]""",
    [{"type": 4, "name": "index", "description": "0 = newest (default)", "required": False}])

cmd("misc", "editsnipe", [], "Show a message's text before it was edited (mods only)",
    """$let[i;$default[$message[0];0]]
$let[e;$snipeGet[$guildID;$channelID;esnipe;$get[i]]]
$onlyIf[$get[e]!=;No recent edits in this channel.]
$jsonLoad[e;$get[e]]
$description[**Before:** $env[e;before]
**After:** $env[e;after]]
$addField[Author;<@$env[e;a]>;true]
$color[#4E5058]""",
    """$let[e;$snipeGet[$guildID;$channelID;esnipe;$default[$option[index];0]]]
$if[$get[e]==;
$ephemeral
$interactionReply[No recent edits in this channel.]
$stop
]
$jsonLoad[e;$get[e]]
$interactionReply[
$description[**Before:** $env[e;before]
**After:** $env[e;after]]
$addField[Author;<@$env[e;a]>;true]
$color[#4E5058]
]""",
    [{"type": 4, "name": "index", "description": "0 = newest (default)", "required": False}])

cmd("misc", "ticket", [], "Open a private ticket channel with the mods",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$onlyIf[$env[cfg;tickets]!=;Tickets are not configured here (mods: set %tickets <#category>).]
$let[tch;$createChannel[$guildID;ticket-$username[$authorID];GuildText;;$env[cfg;tickets]]]
$removeChannelPerms[$get[tch];$guildID;ViewChannel]
$addChannelPerms[$get[tch];$authorID;+ViewChannel;+SendMessages]
$if[$env[cfg;modroles]!=;
$arrayLoad[mrs;,;$env[cfg;modroles]]
$arrayForEach[mrs;mr;$addChannelPerms[$get[tch];$env[mr];+ViewChannel;+SendMessages]]
]
$sendMessage[$get[tch];
$title[Ticket for $userTag[$authorID]]
$description[Explain your issue here. A moderator will respond.
When resolved, press Close — the channel locks for review.]
$color[248046]
$footer[Opened from <#$channelID>]
$addActionRow
$addButton[tkclose-$authorID;Close;Danger]
;false]
$description[✅ Ticket opened: <#$get[tch]>]""",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$if[$env[cfg;tickets]==;
$ephemeral
$interactionReply[Tickets are not configured here.]
$stop
]
$let[tch;$createChannel[$guildID;ticket-$username[$authorID];GuildText;;$env[cfg;tickets]]]
$removeChannelPerms[$get[tch];$guildID;ViewChannel]
$addChannelPerms[$get[tch];$authorID;+ViewChannel;+SendMessages]
$if[$env[cfg;modroles]!=;
$arrayLoad[mrs;,;$env[cfg;modroles]]
$arrayForEach[mrs;mr;$addChannelPerms[$get[tch];$env[mr];+ViewChannel;+SendMessages]]
]
$sendMessage[$get[tch];
$title[Ticket for $userTag[$authorID]]
$description[Explain your issue here. A moderator will respond.
When resolved, press Close — the channel locks for review.]
$color[248046]
$addActionRow
$addButton[tkclose-$authorID;Close;Danger]
;false]
$interactionReply[$ephemeral ✅ Ticket opened: <#$get[tch]>]""", gate="open")

cmd("misc", "eval", [], "Owner-only: evaluate ForgeScript",
    """$let[result;$trim[$eval[$message;false]]]
$if[$charCount[$get[result]]>1900;
$attachment[$get[result];result.txt;true];
$get[result]
]
$try[$!addMessageReactions[$channelID;$messageID;✅]]""",
    None, gate="owner")



# ---------------------------------------------------------------- security v2
cmd("mod", "quarantine", ["iso"], "Isolate a member (quarantine role + 28d mute)",
    """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[r;$punish[quarantine;$guildID;$authorID;$get[target];;$message[1;999]]]
$color[$actionColor[quarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[quarantine];$userAvatar[$get[target];64;png]]
$description[**$userTag[$get[target]]** — isolated for review
> $if[$message[1;999]==;No reason provided;$message[1;999]]]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]""",
    """$let[r;$punish[quarantine;$guildID;$authorID;$option[user];;$option[reason]]]
$interactionReply[
$color[$actionColor[quarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[quarantine];$userAvatar[$option[user];64;png]]
$description[**$userTag[$option[user]]** — isolated for review
> $if[$option[reason]==;No reason provided;$option[reason]]]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]
]""")

cmd("mod", "unquarantine", [], "Release a quarantined member",
    """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[r;$punish[unquarantine;$guildID;$authorID;$get[target];;$message[1;999]]]
$color[$actionColor[unquarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[unquarantine];$userAvatar[$get[target];64;png]]
$description[**$userTag[$get[target]]** — released from quarantine]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]""",
    """$let[r;$punish[unquarantine;$guildID;$authorID;$option[user];;Manual release]]
$interactionReply[
$color[$actionColor[unquarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[unquarantine];$userAvatar[$option[user];64;png]]
$description[**$userTag[$option[user]]** — released from quarantine]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]
]""",
    [{"type": 6, "name": "user", "description": "Member", "required": True}])

cmd("mod", "massban", [], "Ban many users by ID at once",
    """$onlyIf[$message[0]!=;Usage: massban <id> <id> ...]
$let[done;$massBan[$guildID;$authorID;$message]]
$description[⛔ Banned **$get[done]** user(s).]
$color[F23F24]
$footer[Chronolith]""",
    """$onlyIf[$option[ids]!=;$ephemeral Provide space-separated user IDs.]
$let[done;$massBan[$guildID;$authorID;$option[ids]]]
$interactionReply[
$description[⛔ Banned **$get[done]** user(s).]
$color[F23F24]
$footer[Chronolith]
]""",
    [{"type": 3, "name": "ids", "description": "Space-separated user IDs", "required": True}])

cmd("mod", "role", [], "Add or remove a role from a member",
    """$let[mode;$toLowerCase[$message[0]]]
$onlyIf[$or[$get[mode]==add,$get[mode]==remove]==true;Usage: role add|remove <user> <role>]
$let[target;$findUser[$message[1]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[r;""" + ROLE_STRIP.replace("$message[0]", "$message[2]") + """]
$onlyIf[$get[r]!=;Mention the role.]
$if[$get[mode]==add;
$memberAddRoles[$guildID;$get[target];$get[r]]
$description[✅ Added <@&$get[r]> to <@$get[target]>.];
$memberRemoveRoles[$guildID;$get[target];$get[r]]
$description[✅ Removed <@&$get[r]> from <@$get[target]>.]
]
$footer[Chronolith]""",
    """$let[r;$option[role]]
$if[$option[mode]==add;
$memberAddRoles[$guildID;$option[user];$get[r]]
$interactionReply[$description[✅ Added <@&$get[r]> to <@$option[user]>.]];
$memberRemoveRoles[$guildID;$option[user];$get[r]]
$interactionReply[$description[✅ Removed <@&$get[r]> from <@$option[user]>.]]
]
$footer[Chronolith]""",
    [{"type": 3, "name": "mode", "description": "add or remove", "required": True},
     {"type": 6, "name": "user", "description": "Member", "required": True},
     {"type": 8, "name": "role", "description": "Role", "required": True}])

cmd("config", "antinuke", [], "Anti-nuke: watch destructive admin actions",
    """$onlyIf[$or[$toLowerCase[$message[0]]==on,$toLowerCase[$message[0]]==off]==true;Usage: antinuke <on|off> \[threshold\] \[ban|kick|strip\]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;antinuke;on;$if[$toLowerCase[$message[0]]==on;true;false]]
$if[$toLowerCase[$message[0]]==on;
$jsonSet[cfg;antinuke;threshold;$if[$message[1]!=;$message[1];3]]
$jsonSet[cfg;antinuke;action;$if[$message[2]!=;$message[2];ban]]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Anti-nuke **$toLowerCase[$message[0]]**$if[$toLowerCase[$message[0]]==on; — $if[$message[1]!=;$message[1];3] dangerous actions in 20s → $if[$message[2]!=;$message[2];ban]]. Whitelist: mods.]
$color[F23F24]
$footer[Chronolith • Security]""",
    """$let[state;$option[state]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;antinuke;on;$if[$get[state]==on;true;false]]
$if[$get[state]==on;
$jsonSet[cfg;antinuke;threshold;$if[$option[threshold]==0;;$if[$option[threshold]!=;$option[threshold];3]]]
$jsonSet[cfg;antinuke;action;$if[$option[action]!=;$option[action];ban]]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$description[🛡️ Anti-nuke **$get[state]**.]
$color[F23F24]
$footer[Chronolith • Security]
]""",
    [{"type": 3, "name": "state", "description": "on or off", "required": True},
     {"type": 4, "name": "threshold", "description": "Actions within 20s before response (default 3)", "required": False},
     {"type": 3, "name": "action", "description": "ban, kick or strip (default ban)", "required": False}])

cmd("config", "verify", [], "Join verification (unverified role + DM button)",
    """$if[$message[0]==off;
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;verify;role;]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Verification disabled.;
$let[r;""" + ROLE_STRIP + """]
$onlyIf[$get[r]!=;Usage: verify <role|off> — members joining get the role and a verify button.]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;verify;role;"$get[r]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Verification enabled — joiners get <@&$get[r]> and a DM button.
]
$footer[Chronolith • Security]""",
    """$let[r;$default[$option[role];]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;verify;role;"$get[r]"]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$if[$get[r]==;Verification disabled.;✅ Verification enabled.]
$footer[Chronolith • Security]]""",
    [{"type": 8, "name": "role", "description": "Unverified role (omit to disable)", "required": False}])

cmd("automod", "linkwl", [], "Link-filter whitelist domains",
    """$onlyIf[$or[$toLowerCase[$message[0]]==add,$or[$toLowerCase[$message[0]]==remove,$toLowerCase[$message[0]]==list]]==true;Usage: linkwl add|remove|list <domain>]
$if[$toLowerCase[$message[0]]!=list;
$let[d;$toLowerCase[$message[1]]]
$onlyIf[$get[d]!=;Provide the domain.]
]
$if[$toLowerCase[$message[0]]==list;
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$description[Whitelisted domains]
$addField[Domains;$if[$env[cfg;automod;linkwl]==;*none*;$env[cfg;automod;linkwl]];false];
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[ds;,;$env[cfg;automod;linkwl]]
$if[$toLowerCase[$message[0]]==add;
$if[$arraySome[ds;x;$checkCondition[$env[x]==$get[d]]]!=true;
$arrayPush[ds;$get[d]]
$jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Domain whitelisted ($arrayLength[ds] total).];
$description[Already whitelisted.]
];
$let[i;$arrayIndexOf[ds;$get[d]]]
$if[$get[i]==-1;
$description[Not on the list.];
$arraySplice[ds;$get[i];1]
$jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Domain removed ($arrayLength[ds] left).]
]
]
]
$footer[Chronolith • Automod]""",
    """$let[d;$toLowerCase[$option[domain]]]
$let[mode;$option[mode]]
$if[$get[mode]==list;
$interactionReply[Use %linkwl list — slash lists soon.]
$stop
]
$onlyIf[$get[d]!=;$ephemeral Provide the domain.]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[ds;,;$env[cfg;automod;linkwl]]
$if[$get[mode]==add;
$if[$arraySome[ds;x;$checkCondition[$env[x]==$get[d]]]!=true;
$arrayPush[ds;$get[d]]
$jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ Domain whitelisted.]];
$interactionReply[Already whitelisted.]
];
$let[i;$arrayIndexOf[ds;$get[d]]]
$if[$get[i]==-1;
$interactionReply[Not on the list.];
$arraySplice[ds;$get[i];1]
$jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[✅ Domain removed.]]
]
]""",
    [{"type": 3, "name": "mode", "description": "add or remove", "required": True},
     {"type": 3, "name": "domain", "description": "Domain e.g. youtube.com", "required": True}])

cmd("config", "quicksetup", [], "Apply sane defaults in one command",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;modlog;"$channelID"]
$if[$env[cfg;automod;words]==;
$jsonSet[cfg;automod;words;]
]
$jsonSet[cfg;automod;invites;true]
$jsonSet[cfg;automod;spam;true]
$jsonSet[cfg;automod;spamN;5]
$jsonSet[cfg;automod;spamS;5]
$jsonSet[cfg;warns;threshold;3]
$jsonSet[cfg;warns;action;mute]
$jsonSet[cfg;warns;duration;1h]
$jsonSet[cfg;antinuke;on;true]
$jsonSet[cfg;antinuke;threshold;3]
$jsonSet[cfg;antinuke;action;ban]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$author[Chronolith • Quick setup;$userAvatar[$botID;64;png]]
$description[Defaults applied to **this channel** and the server:]
$color[248046]
$addField[Modlog;<#$channelID>;true]
$addField[Automod;invite blocking + flood ratelimit (5 msgs/5s);true]
$addField[Escalation;3 warns → 1h mute;true]
$addField[Anti-nuke;ON — 3 actions/20s → ban;true]
$footer[Chronolith • Fine-tune with %config commands]""",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$jsonSet[cfg;modlog;"$channelID"]
$jsonSet[cfg;automod;invites;true]
$jsonSet[cfg;automod;spam;true]
$jsonSet[cfg;automod;spamN;5]
$jsonSet[cfg;automod;spamS;5]
$jsonSet[cfg;warns;threshold;3]
$jsonSet[cfg;warns;action;mute]
$jsonSet[cfg;warns;duration;1h]
$jsonSet[cfg;antinuke;on;true]
$jsonSet[cfg;antinuke;threshold;3]
$jsonSet[cfg;antinuke;action;ban]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$author[Chronolith • Quick setup;$userAvatar[$botID;64;png]]
$description[Defaults applied — modlog now this channel, automod + escalation + anti-nuke ON.]
$color[248046]
$footer[Chronolith]
]""")

cmd("info", "stats", ["about"], "Bot statistics",
    """$author[Chronolith;$userAvatar[$botID;32;png]]
$color[5865F2]
$description[**Gateway** $ping ms · $guildCount servers · $userCount users
**Runtime** $parseMS[$uptime] · $round[$ram] MB · Node $nodeVersion]
$footer[Chronolith]""",
    """$interactionReply[
$author[Chronolith;$userAvatar[$botID;64;png]]
$color[5865F2]
$addField[Uptime;$parseMS[$uptime];true]
$addField[Ping;$ping ms;true]
$addField[Guilds;$guildCount;true]
$addField[Users;$userCount;true]
$footer[Chronolith • ForgeScript]
]""", gate="open")

cmd("info", "banner", [], "A user's profile banner, full size",
    """$let[target;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$description[$userTag[$get[target]]'s banner]
$image[$userBanner[$get[target];1024;png]]
$footer[Chronolith]""",
    """$let[target;$default[$option[user];$authorID]]
$interactionReply[
$description[$userTag[$get[target]]'s banner]
$image[$userBanner[$get[target];1024;png]]
$footer[Chronolith]
]""",
    [{"type": 6, "name": "user", "description": "User (default: you)", "required": False}], gate="open")


# ---------------------------------------------------------------- phase 1
multi_punish_cmd("hardban", "hardban", [],
    "Ban for a duration, auto-unbanned on expiry (persistent across restarts)",
    duration_required=True, unban_button=True)

cmd("mod", "moderations", ["timedmoderations", "timed"], "Show active timed bans, timeouts and lockdowns",
    """$let[all;$timedList[$guildID]]
$arrayLoad[parts;~~;$get[all]]
$let[bans;$arrayAt[parts;0]]
$let[outs;$arrayAt[parts;1]]
$let[locks;$arrayAt[parts;2]]
$let[bl;]
$if[$get[bans]!=;
$arrayLoad[bs;,;$get[bans]]
$arrayForEach[bs;e;
$let[uid;$advancedTextSplit[$env[e];:;0]]
$let[until;$advancedTextSplit[$env[e];:;1]]
$let[bl;$get[bl]🔨 <@$get[uid]> — banned, ends $discordTimestamp[$get[until];RelativeTime]
]
]
]
$let[ol;]
$if[$get[outs]!=;
$arrayLoad[os;,;$get[outs]]
$arrayForEach[os;e;
$let[uid;$advancedTextSplit[$env[e];:;0]]
$let[until;$advancedTextSplit[$env[e];:;1]]
$let[ol;$get[ol]🔇 <@$get[uid]> — timed out, ends $discordTimestamp[$get[until];RelativeTime]
]
]
]
$let[ll;]
$if[$get[locks]!=;
$arrayLoad[ls;,;$get[locks]]
$arrayForEach[ls;e;
$let[cid;$advancedTextSplit[$env[e];:;0]]
$let[until;$advancedTextSplit[$env[e];:;1]]
$let[ll;$get[ll]🔒 <#$get[cid]> — locked$if[$get[until]!=0;, ends $discordTimestamp[$get[until];RelativeTime];, indefinitely]
]
]
]
$if[$and[$get[bl]==,$and[$get[ol]==,$get[ll]==]]==true;
$description[No active timed moderations.]
$color[#4E5058];
$addField[Hardbans / timed bans;$if[$get[bl]==;*none*;$get[bl]];false]
$addField[Timeouts;$if[$get[ol]==;*none*;$get[ol]];false]
$addField[Lockdowns;$if[$get[ll]==;*none*;$get[ll]];false]
$color[5865F2]
]
$author[Active Moderations;$userAvatar[$botID;32;png]]
$footer[Chronolith]""",
    """$let[all;$timedList[$guildID]]
$ephemeral
$interactionReply[
$author[Active timed moderations;$userAvatar[$botID;64;png]]
$description[$get[all]]
$color[5865F2]
]""")

cmd("config", "protect", [], "Configure protected roles/users (cannot be moderated here)",
    """$if[$message[0]!=;
$let[kind;$toLowerCase[$message[0]]]
$let[act;$toLowerCase[$message[1]]]
$onlyIf[$and[$or[$get[kind]==role,$get[kind]==user]==true,$or[$get[act]==add,$get[act]==remove]==true]==true;Usage: protect <role|user> <add|remove> <target>]
$let[tgt;$if[$get[kind]==role;$replace[$replace[$replace[$message[2];<@&;];!;];>;];$findUser[$message[2]]]]
$onlyIf[$get[tgt]!=;Provide the target.]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[pl;,;$if[$get[kind]==role;$env[cfg;protected;roles];$env[cfg;protected;users]]]
$if[$get[act]==add;
$if[$arraySome[pl;x;$checkCondition[$env[x]==$get[tgt]]]!=true;
$arrayPush[pl;$get[tgt]]
$if[$get[kind]==role;
$!jsonSet[cfg;protected;roles;$arrayJoin[pl;,]]
;
$!jsonSet[cfg;protected;users;$arrayJoin[pl;,]]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Protected $get[kind] added.];
$description[Already protected.]
];
$let[i;$arrayIndexOf[pl;$get[tgt]]]
$if[$get[i]==-1;
$description[Not on the protection list.];
$arraySplice[pl;$get[i];1]
$if[$get[kind]==role;
$!jsonSet[cfg;protected;roles;$arrayJoin[pl;,]]
;
$!jsonSet[cfg;protected;users;$arrayJoin[pl;,]]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Removed from protection.]
]
]
$footer[Chronolith • Security];
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$author[Protection;$userAvatar[$botID;64;png]]
$description[Protected members cannot be moderated in this server — enabled by default, applies alongside owner protection and role hierarchy.]
$addField[Protected roles;$if[$env[cfg;protected;roles]==;*none*;<@&$replace[$env[cfg;protected;roles];,;>, <@&>]>];true]
$addField[Protected users;$if[$env[cfg;protected;users]==;*none*;<@$replace[$env[cfg;protected;users];,;>, <@>]>];true]
$color[5865F2]
$footer[Chronolith • %protect role|user add|remove <target>]
]""",
    """$ephemeral
$interactionReply[
$description[Use the prefix command: %protect <role|user> <add|remove> <target>]
$color[5865F2]
]""")

cmd("config", "dmnotices", [], "Toggle DM notices for moderation actions (failed DMs never fail the action)",
    """$onlyIf[$or[$toLowerCase[$message[0]]==on,$toLowerCase[$message[0]]==off]==true;Usage: dmnotices <on|off>]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;dmnotices;$if[$toLowerCase[$message[0]]==on;true;false]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[DM notices **$toLowerCase[$message[0]]**.]
$color[5865F2]
$footer[Chronolith]""",
    """$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;dmnotices;$option[state]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$ephemeral DM notices updated.]""",
    [{"type": 3, "name": "state", "description": "on or off", "required": True}])

cmd("notes", "editnote", [], "Edit a note (original author kept, editor recorded)",
    """$onlyIf[$message[0]!=;Usage: editnote <note id> <new content>]
$onlyIf[$message[1;999]!=;Provide the new content.]
$let[d;$noteEdit[$guildID;$message[0];$authorID;$message[1;999]]]
$onlyIf[$get[d]==1;Note not found.]
$description[✏️ Note #$message[0] updated — original author preserved, your edit recorded.]
$color[248046]
$footer[Chronolith • Notes]""",
    """$onlyIf[$option[content]!=;$ephemeral Provide the new content.]
$let[d;$noteEdit[$guildID;$option[id];$authorID;$option[content]]]
$onlyIf[$get[d]==1;$ephemeral Note not found.]
$interactionReply[
$description[✏️ Note #$option[id] updated.]
$color[248046]
$footer[Chronolith • Notes]
]""",
    [{"type": 4, "name": "id", "description": "Note ID", "required": True},
     {"type": 3, "name": "content", "description": "New content", "required": True}])

cmd("mod", "modstats", [], "Moderation statistics for a moderator (default: you)",
    """$let[m;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$onlyIf[$get[m]!=;Could not resolve that user.]
$let[raw;$modStats[$guildID;$get[m]]]
$if[$get[raw]==;
$description[<@$get[m]> has no recorded moderation actions yet.]
$color[#4E5058];
$!jsonLoad[st;$get[raw]]
$author[Mod stats • $userTag[$get[m]];$userAvatar[$get[m];64;png]]
$thumbnail[$userAvatar[$get[m];256;png]]
$description[Actions recorded by this moderator]
$addField[Warns;`$default[$env[st;warn];0]`;true]
$addField[Kicks;`$default[$env[st;kick];0]`;true]
$addField[Bans;`$default[$env[st;ban];0]`;true]
$addField[Hardbans;`$default[$env[st;hardban];0]`;true]
$addField[Mutes;`$default[$env[st;mute];0]`;true]
$addField[Softbans;`$default[$env[st;softban];0]`;true]
$color[5865F2]
$footer[Chronolith • Stats]
]""",
    """$let[m;$default[$option[user];$authorID]]
$let[raw;$modStats[$guildID;$get[m]]]
$if[$get[raw]==;
$ephemeral
$interactionReply[No recorded moderation actions yet.]
$stop
]
$!jsonLoad[st;$get[raw]]
$interactionReply[
$author[Mod stats • $userTag[$get[m]];$userAvatar[$get[m];64;png]]
$addField[Warns;`$default[$env[st;warn];0]`;true]
$addField[Kicks;`$default[$env[st;kick];0]`;true]
$addField[Bans;`$default[$env[st;ban];0]`;true]
$addField[Mutes;`$default[$env[st;mute];0]`;true]
$color[5865F2]
]""",
    [{"type": 6, "name": "user", "description": "Moderator (default: you)", "required": False}])

# ---------------------------------------------------------------- modlog viewer
cmd("modlog", "modlog", ["modlogs"], "View moderation logs (recent / by user / by action / set channel)",
    """$let[mode;$if[$message[0]!=;$toLowerCase[$message[0]];recent]]
$if[$get[mode]==user;
$let[target;$findUser[$message[1]]]
$onlyIf[$get[target]!=;Provide a target: modlog user <target>]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
]
$if[$get[mode]==action;
$let[atype;$toLowerCase[$message[1]]]
$onlyIf[$get[atype]!=;Provide an action type: modlog action <warn|ban|kick|...>]
]
$if[$or[$get[mode]==recent,$get[mode]==user,$or[$get[mode]==action,$get[mode]==set]]!=true;
Usage: modlog \[recent\|user\|action\|set\] \[...\]
;
$if[$get[mode]==set;
$let[c;$if[$message[1]==off;;""" + CH_STRIP.replace("$message[0]", "$message[1]") + """ ]]
$jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;modlog;$trim[$get[c]]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[$if[$get[c]==;Modlog channel disabled.;Modlog channel set to <#$get[c]>.]]
$color[5865F2]
;
$if[$get[mode]==user;
$arrayLoad[cs;,;$get[uc]]
$arrayLoad[out;]
$arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$return[-# **#$env[k]** $actionEmoji[$env[one;t]] · <@$env[one;m]> · $env[one;r]];out]
$author[User logs • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[5865F2]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[cs] case(s)];
$if[$get[mode]==action;
$let[total;$getGuildVar[caseCount;$guildID;0]]
$let[ptr;$get[total]]
$arrayLoad[out;]
$loop[200;
$if[$or[$get[ptr]<1,$math[$get[total]-$get[ptr]]>=200];
$break
]
$jsonLoad[one;$getGuildVar[case_$get[ptr];$guildID;{}]]
$if[$env[one;t]==$get[atype];
$arrayPush[out;-# **#$get[ptr]** · <@$env[one;u]> · $env[one;r]]
]
$let[ptr;$math[$get[ptr]-1]]
]
$author[Action logs • $get[atype];$userAvatar[$botID;64;png]]
$color[5865F2]
$description[$if[$arrayLength[out]==0;No cases of that type in the last 200.;$arrayJoin[out;
]]]
$footer[Chronolith • scanned up to 200];
$let[total;$getGuildVar[caseCount;$guildID;0]]
$let[start;$math[$if[$get[total]>10;$get[total]-10;0]]]
$let[ptr;$math[$get[start]+1]]
$arrayLoad[out;]
$loop[12;
$if[$get[ptr]>$get[total];
$break
]
$jsonLoad[one;$getGuildVar[case_$get[ptr];$guildID;{}]]
$arrayPush[out;-# **#$get[ptr]** $actionEmoji[$env[one;t]] · <@$env[one;u]> · $env[one;r]]
$let[ptr;$math[$get[ptr]+1]]
]
$author[Recent logs;$userAvatar[$botID;64;png]]
$color[5865F2]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $get[total] case(s) total]
]
]
]
]""" ,
    """$ephemeral
$interactionReply[
$author[Chronolith • Modlog;$userAvatar[$botID;64;png]]
$description[Use the prefix command for log views, or:
-# %modlog recent \| %modlog user <target> \| %modlog action <type> \| %modlog set <#channel|off>]
$color[5865F2]
]""", gate="mod")

# ---------------------------------------------------------------- staff notes
cmd("notes", "addnote", ["setnote"], "Add a staff note to a user",
    """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$onlyIf[$message[1;999]!=;Note content is required.]
$let[n;$addNote[$guildID;$get[target];$authorID;$message[1;999]]]
$author[Note #$get[n];$userAvatar[$get[target];32;png]]
$color[5865F2]
$description[<@$get[target]> — $userTag[$get[target]]

> $message[1;999]]
$footer[Chronolith]""",
    """$let[n;$addNote[$guildID;$option[user];$authorID;$option[content]]]
$interactionReply[
$author[📝 Note #$get[n];$userAvatar[$botID;64;png]]
$description[**$userTag[$option[user]]**
> $option[content]]
$color[5865F2]
$footer[Chronolith • Notes]
]""",
    [{"type": 6, "name": "user", "description": "Target user", "required": True},
     {"type": 3, "name": "content", "description": "Note content", "required": True}])

cmd("notes", "removenote", ["removenotes", "deletenote", "deletenotes", "delnote", "delnotes"],
    "Remove notes by their IDs",
    """$let[removed;0]
$arrayLoad[nids; ;$message]
$arrayForEach[nids;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;None of those note IDs exist.]
$description[🗑️ Removed `$get[removed]` note(s).]
$color[248046]
$footer[Chronolith • Notes]""",
    """$let[removed;0]
$arrayLoad[nids; ;$option[ids]]
$arrayForEach[nids;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;$ephemeral None of those note IDs exist.]
$interactionReply[
$description[🗑️ Removed `$get[removed]` note(s).]
$color[248046]
$footer[Chronolith • Notes]
]""",
    [{"type": 3, "name": "ids", "description": "Space-separated note IDs", "required": True}])

cmd("notes", "clearnotes", [], "Clear all notes from one or more targets",
    """$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found.]
$let[cleared;0]
$arrayLoad[nt;,;$env[tj;ids]]
$arrayForEach[nt;u;
$arrayLoad[ns;,;$userNotes[$guildID;$env[u]]]
$arrayForEach[ns;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[cleared;1]
]
]
]
$description[🧼 Cleared `$get[cleared]` note(s).]
$color[248046]
$footer[Chronolith • Notes]""",
    """$arrayLoad[nt;,;$option[users]]
$let[cleared;0]
$arrayForEach[nt;u;
$arrayLoad[ns;,;$userNotes[$guildID;$env[u]]]
$arrayForEach[ns;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[cleared;1]
]
]
]
$interactionReply[
$description[🧼 Cleared `$get[cleared]` note(s).]
$color[248046]
$footer[Chronolith • Notes]
]""",
    [{"type": 3, "name": "users", "description": "Mentions/usernames/IDs", "required": True}])

cmd("notes", "notes", [], "Show a user's staff notes (first target only)",
    """$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[ns;$userNotes[$guildID;$get[target]]]
$onlyIf[$get[ns]!=;No notes on record for that user.]
$arrayLoad[ns;,;$get[ns]]
$arrayLoad[out;]
$arrayMap[ns;n;$jsonLoad[one;$noteGet[$guildID;$env[n]]]$return[-# **#$env[n]** · <@$env[one;by]> · $discordTimestamp[$env[one;ts];RelativeTime]
> $env[one;c]];out]
$author[Notes • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[5865F2]
$thumbnail[$userAvatar[$get[target];256;png]]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[ns] note(s)]""",
    """$let[ns;$userNotes[$guildID;$option[user]]]
$if[$get[ns]==;
$ephemeral
$interactionReply[No notes on record for that user.]
$stop
]
$arrayLoad[ns;,;$get[ns]]
$arrayLoad[out;]
$arrayMap[ns;n;$jsonLoad[one;$noteGet[$guildID;$env[n]]]$return[-# **#$env[n]** · <@$env[one;by]> · $discordTimestamp[$env[one;ts];RelativeTime]
> $env[one;c]];out]
$interactionReply[
$author[Notes • $userTag[$option[user]];$userAvatar[$option[user];64;png]]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[ns] note(s)]
]""",
    [{"type": 6, "name": "user", "description": "Target user (first only)", "required": True}], gate="mod")

# infractions = cases (plan names)
for c in CMDS:
    if c["name"] == "cases":
        c["aliases"] = ["infractions", "history"]
        break


# ---------------------------------------------------------------- emit
def js_escape(body):
    return body.replace("\\", "\\\\").replace("`", "\\`")


def prefix_file(c):
    if c["gate"] == "owner":
        gate = OWNER_GATE
    elif c["gate"] == "open":
        gate = OPEN_PREFIX_GATE
    else:
        gate = PREFIX_GATE.replace("{name}", c["name"])
    aliases = ", ".join(f'"{a}"' for a in c["aliases"])
    alias_line = f"    aliases: [{aliases}],\n" if aliases else ""
    return f"""/*
 * Chronolith — {c['name']}: {c['desc']}
 * Prefix command (mirrors the /{c['name']} slash command).
 */
module.exports = {{
    name: "{c['name']}",
{alias_line}    type: "messageCreate",
    code: `
{gate}
{js_escape(c['prefix'])}
    `
}};
"""


def slash_file(c):
    if c["slash"] is None:
        return None
    opts = ""
    for o in c["options"]:
        req = "true" if o.get("required") else "false"
        opts += f'            {{ type: {o["type"]}, name: "{o["name"]}", description: "{o["description"]}", required: {req} }},\n'
    opts_block = f"\n        options: [\n{opts}        ]" if opts else ""
    gate = "" if c["gate"] == "open" else SLASH_GATE + "\n"
    if c["gate"] == "owner":
        gate = "$onlyIf[$authorID==$botOwnerID;$ephemeral Owner only.]\n"
    return f"""/*
 * Chronolith — {c['name']}: {c['desc']}
 * Slash command (mirrors the %{c['name']} prefix command).
 */
module.exports = {{
    data: {{
        type: 1,
        name: "{c['name']}",
        description: "{c['desc'].replace('"', "'")}"{("," + opts_block) if opts_block else ""}
    }},
    type: 0,
    code: `
{gate}{js_escape(c['slash'])}
    `
}};
"""



made = 0
for c in CMDS:
    pdir = os.path.join(ROOT, "prefixesCmd", c["folder"])
    sdir = os.path.join(ROOT, "slashesCmd")   # FLAT: the loader turns subfolders into subcommand groups
    os.makedirs(pdir, exist_ok=True)
    os.makedirs(sdir, exist_ok=True)
    c["prefix"] = _fix_footers(c["prefix"], c["folder"])
    if c.get("slash"):
        c["slash"] = _fix_footers(c["slash"], c["folder"])
    with open(os.path.join(pdir, c["name"] + ".js"), "w", encoding="utf-8") as f:
        f.write(prefix_file(c))
    made += 1
    sf = slash_file(c)
    if sf:
        with open(os.path.join(sdir, c["name"] + ".js"), "w", encoding="utf-8") as f:
            f.write(sf)
        made += 1

print(f"Generated {made} command files.")
