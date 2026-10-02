#!/usr/bin/env python3
"""Generate the knowledge/ folder for BotForge / ForgeScript.

Sources (all cached under .knowledge-cache/):
  - meta/            raw GitHub metadata for all 13 packages (functions/events/enums/changelogs/readme)
  - guides/          full guide content from the BotForge Developer API
  - source_map.json  per-function source info harvested from cloned repos
  - _registry.json   extension registry from the BotForge Developer API
"""
import json, os, re, glob, html

CACHE = '/workspace/BotForge/.knowledge-cache'
OUT = '/workspace/BotForge/knowledge'

# ---------------------------------------------------------------- loaders

def load_meta(pkg, res):
    p = f'{CACHE}/meta/{pkg}__{res}Url.json'
    if not os.path.exists(p):
        return None
    return json.load(open(p))

def load_readme(pkg):
    p = f'{CACHE}/meta/{pkg}__readme.md'
    return open(p, encoding='utf-8').read() if os.path.exists(p) else None

REGISTRY = json.load(open(f'{CACHE}/meta/_registry.json'))
HANDLERS = json.load(open(f'{CACHE}/handlers.json')) if os.path.exists(f'{CACHE}/handlers.json') else {}
ENUM_USAGE = json.load(open(f'{CACHE}/enum_usage.json')) if os.path.exists(f'{CACHE}/enum_usage.json') else {}

# state-entity key -> $old/$new accessor function names (from the `state` function category)
STATE_ACCESSORS = {
    'message': ('$oldMessage', '$newMessage'), 'member': ('$oldMember', '$newMember'),
    'channel': ('$oldChannel', '$newChannel'), 'role': ('$oldRole', '$newRole'),
    'guild': ('$oldGuild', '$newGuild'), 'user': ('$oldUser', '$newUser'),
    'emoji': ('$oldEmoji', '$newEmoji'), 'presence': ('$oldPresence', '$newPresence'),
    'invite': ('$oldInvite', '$newInvite'), 'entitlement': ('$oldEntitlement', '$newEntitlement'),
    'ban': (None, None), 'scheduledEvent': ('$oldScheduledEvent', '$newScheduledEvent'),
    'stage': ('$oldStage', '$newStage'), 'sticker': ('$oldSticker', '$newSticker'),
    'automodRule': ('$oldAutomodRule', '$newAutomodRule'), 'soundboardSound': ('$oldSound', '$newSound'),
    'subscription': ('$oldSubscription', '$newSubscription'), 'voiceState': ('$oldState', '$newState'),
    'voiceServer': ('$voiceServer', None), 'voiceEffect': ('$effect', None),
    'audit': ('$auditLog', None), 'bulk': ('$bulk', None), 'poll': (None, None),
}

EVENT_CURATED = {
    'messageCreate': ('Typical prefix command', '// commands/ping.js\nmodule.exports = {\n    name: "ping",\n    code: `$reply[Pong! $ping ms;no]`\n}'),
    'messageUpdate': ('old/new states', '// events/messageUpdate.js — both snapshots readable\nmodule.exports = {\n    type: "messageUpdate",\n    code: "$oldMessage[content] -> $newMessage[content]"\n}'),
    'guildMemberAdd': ('Welcome on join', '// events/guildMemberAdd.js\nmodule.exports = {\n    type: "guildMemberAdd",\n    code: "$sendMessage[$channelID;Welcome <@$newMember[id]>!;false]"\n}'),
    'clientReady': ('Startup handler (no user context)', '// events/clientReady.js\nmodule.exports = {\n    type: "clientReady",\n    code: "$log[Bot ready as $username[$clientID]]"\n}'),
    'interactionCreate': ('Component/button routing', '// events/interactionCreate.js\nmodule.exports = {\n    type: "interactionCreate",\n    allowedInteractionTypes: ["button"],\n    code: `\n        $onlyIf[$customID==my-button]\n        $interactionReply[You clicked it!]\n    `\n}'),
    'messageDelete': ('Snipe-style capture', '// events/messageDelete.js\nmodule.exports = {\n    type: "messageDelete",\n    code: "$setUserVar[lastDeleted;$messageContent;$authorID]"\n}'),
}
SOURCE = json.load(open(f'{CACHE}/source_map.json'))
GUIDES = []
for p in sorted(glob.glob(f'{CACHE}/guides/guide-*.json')):
    try:
        d = json.load(open(p))
        if d.get('success') and d.get('guide'):
            GUIDES.append(d['guide'])
    except Exception:
        pass

VERIFIED_QUIRKS = {  # live-verified against installed 2.7.1 (2026-09-28)
    'color': [
        'VERIFIED (2.7.1): hex values that are valid JS scientific notation (digits-E-digits, e.g. 4E5058) hit the resolver numeric pre-check and become Infinity — ColorConvert throws. Prefix such hexes with # ($color[#4E5058]).',
    ],  # live-verified against installed 2.7.1 (2026-09-28)
    'parseString': [
        'VERIFIED (2.7.1): this is the native text-to-ms converter (`10m` -> 600000). Returns 0 for unparsable input, no error. Its sibling `$parseMS` does the reverse (ms -> human text) - do not confuse them.',
    ],
    'parseMS': [
        'VERIFIED (2.7.1): converts ms -> human-readable text (NOT text->ms). For text->ms use `$parseString[duration]`.',
    ],
    'arrayIncludes': [
        'VERIFIED (2.7.1): digit-string needles are parseJSON\'d to Numbers before comparison and then NEVER match string elements - for numeric-string membership use `$arraySome[arr;x;$checkCondition[$env[x]==needle]]`.',
    ],
    'jsonSet': [
        'VERIFIED (2.7.1): operates on the MOST RECENTLY `$jsonLoad`-ed JSON (hidden last-loaded pointer; there is no variable argument). The value is parseJSON\'d: bare snowflakes lose precision past 2^53 - quote-wrap large IDs. Two consecutive dynamic keys (`$get[a];$get[b]`) silently fail.',
    ],
    'jsonLoad': [
        'VERIFIED (2.7.1): writes the ENVIRONMENT store - read with `$env[var]`, not `$get[var]` (keywords store, always empty here). Also sets the hidden last-loaded pointer used by `$jsonSet`/`$jsonDelete`.',
    ],
    'ephemeral': [
        'VERIFIED (2.7.1): the flag is read at FLUSH time (defer/reply), not at call time - it must appear BEFORE `$defer`/`$interactionReply`; after them it has no effect.',
    ],
    'cooldown': [
        'VERIFIED (2.7.1): the trip error-send bypasses `doNotSend` and RESETS the shared container - embeds/components built before the check are destroyed when it fires. Keys are per-process (in-memory, instance-ID based): restarts clear them.',
    ],
    'loop': [
        'VERIFIED (2.7.1): plain body output is DISCARDED - only `$return[...]` values accumulate into the loop result. A `$loop[-1;...]` spin-wait needs both `$break` and `$wait[n]` inside.',
    ],
    'textSplit': [
        'VERIFIED (2.7.1): writes a HIDDEN split-store instance (separate from named arrays) read by `$splitText[i]`/`$getSplitTextLength`/`$splitTextJoin` - disjoint from `$arrayLoad` arrays.',
    ],
    'httpRequest': [
        'VERIFIED (2.7.1): returns the HTTP STATUS CODE, not the body - the body goes into the response env var (read with `$env[var]`). Staged options (headers/body/form) are consumed and CLEARED by each call - restage for consecutive requests.',
    ],
}

SLUGS = {  # packageName -> folder slug
    'ForgeScript': 'forgescript', 'ForgeDB': 'forgedb', 'ForgeRegex': 'forgeregex',
    'ForgeCanvas': 'forgecanvas', 'ForgeMusic': 'forgemusic', 'ForgeTopGG': 'forgetopgg',
    'ForgeLinked': 'forgelinked', 'ForgeGiveaways': 'forgegiveaways', 'ForgeMinecraft': 'forgeminecraft',
    'ForgeIndia': 'forgeindia', 'ForgeColor': 'forgecolor', 'QuorielDB': 'quorieldb', 'Edge': 'edge', 'ForgeVSC': 'forgevsc',
}
CORE_PKG = 'ForgeScript'
PACKAGES = [e.get('packageName') for e in REGISTRY]

def source_of(pkg, name):
    return (SOURCE.get(pkg) or {}).get(name)

# ---------------------------------------------------------------- semantics knowledge

TYPE_GUIDE = {
    'String': ('plain text', 'Passed through as-is after inner `$functions` are resolved and `\\` escapes are processed.'),
    'Number': ('a numeric value', 'Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.'),
    'BigInt': ('a very large integer', 'Coerced with JS `BigInt()` — must be an integer literal like `123456789012345678n` or `123456789012345678`.'),
    'Boolean': ('`true` / `false`', 'Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.'),
    'URL': ('a URL', 'Must match `https://...` — plain `http://` URLs FAIL the built-in check (regex is `^http?s:\\/\\/`, which effectively requires the `s`). A Discord custom emoji string is also accepted and auto-converted to its CDN URL.'),
    'Json': ('a JSON string', 'Parsed with ForgeScript\'s lenient `parseJSON`; invalid JSON is rejected.'),
    'Color': ('a color', 'Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.'),
    'Time': ('a duration', 'A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).'),
    'Date': ('a date', 'A unix timestamp in milliseconds (number) or any string the JS `Date` constructor understands (`2024-01-01`, ISO strings, ...).'),
    'Channel': ('a channel ID', 'Must be a 16-23 digit snowflake; fetched from the client\'s channel cache/API.'),
    'TextChannel': ('a textable channel ID', 'Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.'),
    'User': ('a user ID', 'Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.'),
    'Member': ('a member ID', 'Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.'),
    'Role': ('a role ID', 'Looked up in the guild resolved by the `pointer` argument or the context guild.'),
    'RoleOrUser': ('a role or user ID', 'Tried as a role in the pointer guild first, then as a user fetch.'),
    'Guild': ('a guild ID', 'Taken from `client.guilds.cache` — the guild must be cached.'),
    'Message': ('a message ID', 'Fetched from the channel resolved by the `pointer` argument or the context channel.'),
    'Emoji': ('an emoji', 'Accepts a raw emoji ID, a `<:name:id>` / `<a:name:id>` string, or a `cdn.discordapp.com/emojis/<id>` URL. Searched in guild emojis, then application emojis.'),
    'GuildEmoji': ('a guild emoji', 'Same resolution as Emoji but only guild emojis are searched.'),
    'ApplicationEmoji': ('an application emoji', 'Same resolution as Emoji but only application (global bot) emojis are searched.'),
    'Sticker': ('a sticker ID or CDN URL', 'Fetched via `client.fetchSticker`.'),
    'Invite': ('an invite code', 'Fetched via `client.fetchInvite`. Must be a snowflake-shaped code — full `https://discord.gg/...` URLs are rejected.'),
    'Webhook': ('a webhook ID', 'Fetched via `client.fetchWebhook`.'),
    'Reaction': ('a reaction emoji', 'Parsed with `parseEmoji` and looked up on the message resolved by the `pointer` argument.'),
    'Attachment': ('a file', 'Accepts a URL (downloaded), an existing local path, or raw text content (uploaded as-is with no name).'),
    'Permission': ('a permission name', 'A `PermissionFlagsBits` key like `ManageMessages`, `BanMembers` (camelCase, no spaces).'),
    'OverwritePermission': ('an overwrite permission', 'A permission name PRECEDED by a symbol: `+Perm` (allow), `-Perm` (deny), `/Perm` (inherit/null).'),
    'Enum': ('one of the allowed enum values', 'Must be an exact key of the function\'s enum — see the enum\'s page under `enums/`.'),
    'Unknown': ('anything', 'Kept as the raw resolved string.'),
    'ForumTag': ('a forum tag ID', 'Looked up in the available tags of the pointer channel.'),
    'AutomodRule': ('an automod rule ID', 'Fetched from the pointer guild\'s autoModerationRules manager.'),
    'ScheduledEvent': ('a scheduled event ID', 'Fetched from the pointer guild\'s scheduledEvents manager.'),
    'StageInstance': ('a stage instance', 'Resolved from the stage channel ID or the pointer guild\'s stage instances.'),
    'SoundboardSound': ('a soundboard sound ID', 'Fetched from the pointer guild\'s soundboardSounds manager.'),
    'Template': ('a guild template code', 'Fetched via `client.fetchGuildTemplate`.'),
}

CATEGORY_INTRO = {
    'array': 'Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.',
    'audit': 'Audit-log functions read Discord guild audit log entries (requires the `GuildModeration` intent and usually `ViewAuditLog` permission).',
    'automod': 'Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).',
    'bot': 'Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.',
    'buffer': 'Buffer functions build and transform binary buffers (Node `Buffer`), typically for file attachments and canvas workflows.',
    'channel': 'Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.',
    'command': 'Command functions inspect the command currently executing (name, count, info) or registered commands.',
    'component': 'Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.',
    'condition': 'Condition helpers (`$checkCondition`, `$and`, `$or`, validators) evaluate boolean logic over resolved values.',
    'cooldown': 'Cooldown functions gate command execution per user/guild/channel/member with durations, and inspect remaining cooldown time.',
    'crypto': 'Crypto functions hash and encode strings (md5, sha family, base64, ...).',
    'embed': 'Embed functions mutate the message\'s embed container in-place: `$title`, `$description`, `$addField`, `$color`, `$author`, `$footer`, `$image`, `$thumbnail`, `$timestamp`. They take an optional index to target a specific embed.',
    'emoji': 'Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.',
    'entitlement': 'Entitlement functions read Discord monetization entitlements (premium purchases) for the application.',
    'event': 'Event functions (re)schedule guild scheduled events and set their channel/location metadata.',
    'file': 'File functions attach files to the outgoing message container (local paths, URLs or buffers).',
    'formatting': 'Formatting functions transform text output (casing, separators, padding, unicode helpers).',
    'guild': 'Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.',
    'http': 'HTTP functions perform network requests (`$httpRequest` and its header/body/result companions). They run against the BotForge validate API\'s syntax rules the same as any other function.',
    'interaction': 'Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.',
    'invite': 'Invite functions create, inspect and delete guild invites.',
    'json': 'JSON functions parse/query/build JSON documents held in the environment.',
    'limiter': 'Limiter functions restrict execution (`$onlyIf`, `$onlyForUsers`, `$onlyForRoles`, ...) and early-exit a command via `$stop`.',
    'logging': 'Logging functions print to the host console (useful for debugging command code).',
    'lookup': 'Lookup functions resolve Discord entities by name or other non-ID identifiers.',
    'math': 'Math functions evaluate arithmetic expressions and apply numeric operations.',
    'member': 'Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.',
    'mention': 'Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).',
    'message': 'Message functions read, send, edit, delete, pin, react to and await messages.',
    'mention ': 'Mention helpers.',
    'number': 'Number functions format and round numeric values.',
    'other': 'Uncategorized utilities.',
    'poll': 'Poll functions build and inspect Discord polls and their answers.',
    'reaction': 'Reaction functions add/remove/clear reactions and read reaction data.',
    'role': 'Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.',
    'soundboard': 'Soundboard functions manage Discord soundboard sounds.',
    'state': 'State functions access event context state — old/new values for update events (`old`, `new` prefixes), voice states, presences.',
    'statement': 'Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.',
    'sticker': 'Sticker functions read and manage guild stickers.',
    'string': 'String functions transform and inspect text (slicing, casing, search, split/join).',
    'system': 'System functions expose host/runtime info — uptime, memory, node version, platform.',
    'time': 'Time functions parse, format and convert timestamps/durations.',
    'unsafe': 'Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.',
    'user': 'User functions read user properties (username, tag, avatar, banners, badges, flags).',
    'variable': 'Variable functions manage TWO interpreter variable stores: `$let` writes the **keywords** store and `$get` reads it; `$env` reads the separate **environment** store (custom-fn params, `$jsonLoad`, `$try` errors, `$loop` counters, `$httpRequest` responses) and walks nested paths; `$has` checks existence. `$let[x;v]$env[x]` is empty — never cross the stores.',
    'webhook': 'Webhook functions create, edit, execute and delete webhooks.',
    'websocket': 'Websocket functions open and manage custom websocket connections.',
    'interaction ': 'Interaction helpers.',
}

CATEGORY_INTRO_DEFAULT = 'See the function list below for exact signatures.'

# Placeholder sample values per arg type / name heuristics
def placeholder_for(arg):
    t = arg.get('type') or 'String'
    n = (arg.get('name') or 'value').lower()
    if t == 'Number': return '5'
    if t == 'Boolean': return 'true'
    if t == 'BigInt': return '123456789012345678'
    if t == 'Time': return '10m'
    if t == 'Date': return '1710000000000'
    if t == 'Color': return '#5865F2'
    if t == 'Json': return '{"key":"value"}'
    if t == 'URL': return 'https://example.com'
    if t == 'Permission': return 'ManageMessages'
    if t == 'OverwritePermission': return '+ManageMessages'
    if t == 'Enum': return 'value'
    if t in ('Channel','TextChannel'): return '123456789012345678'
    if t == 'User': return '123456789012345678'
    if t == 'Member': return '123456789012345678'
    if t == 'Role': return '123456789012345678'
    if t == 'Message': return '123456789012345678'
    if t == 'Guild': return '123456789012345678'
    if t in ('Emoji','GuildEmoji','ApplicationEmoji','Reaction'): return ':smile:'
    if t == 'Invite': return 'abc123'
    if t == 'Webhook': return '123456789012345678'
    if t == 'Sticker': return '123456789012345678'
    if t == 'Attachment': return './file.png'
    # String heuristics
    if 'content' in n or 'message' in n or 'text' in n: return 'Hello!'
    if 'url' in n or 'link' in n: return 'https://example.com'
    if 'emoji' in n: return ':smile:'
    if 'color' in n or 'colour' in n: return '#5865F2'
    if 'name' in n: return 'name'
    if n.endswith('id'): return '123456789012345678'
    if 'time' in n or 'duration' in n: return '10m'
    if 'code' in n: return 'code'
    if 'json' in n: return '{"key":"value"}'
    if 'query' in n or 'search' in n: return 'query'
    if 'separator' in n or 'split' in n: return ','
    if 'prefix' in n: return '!'
    return 'value'

# ---------------------------------------------------------------- curated examples (hand-verified)

CURATED = {}

def _cur(name, examples):
    CURATED[name] = examples

_cur('$if', [
    ('Basic true branch', '$if[$authorID==123456789012345678;Welcome back, owner!;You are not the owner.]'),
    ('With nested functions', '$if[$messageCount>=10;$channelSendMessage[$channelID;Thanks for being active!;false]]'),
    ('Comparison operators', '$if[$randomNumber[1;10]>=5;$log[high];$log[low]]'),
])
_cur('$let', [
    ('Store an array', '$let[myArray;apple;banana;cherry]'),
    ('Store a computed value', '$let[total;$sum[2;3]]'),
    ('Read it back', '$get[myArray]'),
])
_cur('$get', [
    ('Read an environment key', '$get[myArray]'),
    ('Read with a fallback context', 'Hello $get[userName]!'),
])
_cur('$env', [
    ('Read an environment key (same storage as $get)', '$env[myKey]'),
    ('Read an array key (JSON-serialized output)', '$env[myArray]'),
])
_cur('$sendMessage', [
    ('Simple send', '$sendMessage[$channelID;Hello world!;false]'),
    ('Return the sent message ID', '$let[msgID;$sendMessage[$channelID;Pinned!;true]]'),
    ('To another channel', '$sendMessage[123456789012345678;Announcement from $username[$authorID]!;false]'),
])
_cur('$reply', [
    ('Reply to the trigger message', '$reply[Hello!;no]'),
    ('Mention-style reply', '$reply[Hi $username!;yes]'),
])
_cur('$arrayAt', [
    ('Index access', '$arrayAt[myArray;0]'),
    ('Negative index (from the end)', '$arrayAt[myArray;-1]'),
])
_cur('$arrayJoin', [
    ('Join with separator', '$arrayJoin[myArray;, ]'),
    ('Join into a sentence', '$arrayJoin[myArray; and ]'),
])
_cur('$arrayLength', [
    ('Count elements', '$arrayLength[myArray]'),
    ('Guard before access', '$if[$arrayLength[myArray]>0;$arrayAt[myArray;0];The array is empty.]'),
])
_cur('$while', [
    ('Count to five', '$while[$get[i]<5;$let[i;$sum[$get[i];1]]]$get[i]'),
])
_cur('$loop', [
    ('Repeat code N times', '$loop[3;$username[$authorID]]'),
])
_cur('$httpRequest', [
    ('GET into the default result variable (returns the HTTP status code!)', '$httpRequest[https://api.example.com/ping;GET]'),
    ('Gate on status, then read the auto-parsed body from the env var', '$if[$httpRequest[https://api.example.com/data;GET;res]==200;$env[res;status];request failed]'),
    ('POST with staged options', '$httpSetContentType[Text]$httpAddHeader[Authorization;Bearer token]$httpSetBody[{"q":"hi"}]$!httpRequest[https://api.example.com/search;POST;res]'),
])
_cur('$onlyIf', [
    ('Simple gate', '$onlyIf[$authorID!=123456789012345678;You are banned from this command!]'),
    ('Numeric gate', '$onlyIf[$arrayLength[list]>0;Nothing to show.]'),
])
_cur('$cooldown', [
    ('Per-user cooldown (id, duration, message)', '$cooldown[$authorID;10m;You are on cooldown, try again later!]'),
    ('Per-user-per-command composite key', '$cooldown[$authorID-$commandName;30s;Slow down! Use this command every 30s max.]'),
])
_cur('$checkCondition', [
    ('Boolean result', '$checkCondition[$authorID==123456789012345678]'),
    ('Combining with $and/$or', '$checkCondition[$and[$userBot[$authorID]==false;$guildID!=]]'),
])
_cur('$interactionReply', [
    ('Reply to a slash command', '$interactionReply[Hello from a slash command!]'),
    ('Ephemeral reply (set the flag first, then reply)', '$ephemeral$interactionReply[This is only visible to you.]'),
])
_cur('$defer', [
    ('Defer the reply while working', '$defer$interactionReply[Done processing!]'),
])
_cur('$log', [
    ('Log to console', '$log[Command used by $username[$authorID]]'),
    ('Multiple values (rest)', '$log[arg1;arg2;arg3]'),
])
_cur('$c', [
    ('Inline comment', '$c[anything here is ignored]'),
])
_cur('$djsEval', [
    ('Evaluate JS against the client', '$djsEval[client.user.username;true]'),
])
_cur('$timestamp', [
    ('Current unix seconds', '$timestamp[s]'),
    ('Milliseconds', '$timestamp[ms]'),
])
_cur('$addField', [
    ('Add an embed field', '$addField[Title;Description;false]'),
    ('Inline field', '$addField[HP;100/100;true]'),
])
_cur('$author', [
    ('Set embed author', '$author[ForgeScript Docs;https://docs.botforge.org;https://docs.botforge.org/media/logos/og_card.png]'),
])
_cur('$addButton', [
    ('Primary button', '$addButton[my-custom-id;Click me;primary;false;]'),
    ('Danger button with emoji', '$addButton[ban-btn;Ban;danger;false;:warning:]'),
])
_cur('$username', [
    ('By ID', '$username[123456789012345678]'),
    ('Current author', '$username[$authorID]'),
])
_cur('$message', [
    ('All arguments after the command (bare form)', '$message'),
    ('First argument (0-based — the command name is not included)', '$message[0]'),
    ('Argument slice (start;end)', '$message[1;3]'),
])

_cur('$arrayMap', [
    ('Map (and filter) an env array — only $return values are collected', '$arrayLoad[options; ;One Two Three]$arrayMap[options;opt;$return[$toLowerCase[$env[opt]]];lowered]'),
    ('In-place filtering: same name for input and output', '$arrayMap[options;opt;$if[$checkContains[$toLowerCase[$env[opt]];search];$return[$env[opt]]];options]'),
])
_cur('$addChoice', [
    ('Inside an autocomplete interaction handler', '$addChoice[Visible name;internal_value]'),
    ('Adding many from an array', '$arrayForEach[options;opt;$addChoice[$env[opt];$env[opt]]]'),
])
_cur('$autocomplete', [
    ('Finalize and send accumulated choices', '$autocomplete'),
])
_cur('$focusedOptionValue', [
    ('Capture what the user typed so far', '$let[focusedValue;$focusedOptionValue]'),
])

_cur('$callFunction', [
    ('Call a client-registered custom function', '$callFunction[admin;$guildID;$authorID]'),
    ('Same thing via direct invocation', '$admin[$guildID;$authorID]'),
])
_cur('$hasPerms', [
    ('Check a member permission', '$hasPerms[$guildID;$authorID;Administrator]'),
])

# ---------------------------------------------------------------- helpers

def fs_sig(f):
    """Render signature string."""
    name = f['name']
    args = f.get('args') or []
    if not args:
        return name if f.get('brackets') else name
    parts = []
    for a in args:
        p = a['name']
        parts.append(p)
    return f"{name}[{';'.join(parts)}]"

def md_escape_table(s):
    return (s or '').replace('|', '\\|').replace('\n', ' ')

def slugify(s):
    s = re.sub(r'[^A-Za-z0-9]+', '-', s or '').strip('-').lower()
    return s or 'untitled'

def guides_for(target_type, target_name):
    out = []
    for g in GUIDES:
        if g.get('targetType') == target_type and (g.get('targetName') or '').lower() == (target_name or '').lower():
            out.append(g)
    return out

# ---------------------------------------------------------------- function renderer

def render_function_md(pkg, f, cat_lookup, out_rel_prefix):
    """out_rel_prefix: path prefix from the file's dir back to knowledge root (for links)."""
    name = f['name']
    args = f.get('args') or []
    src = source_of(pkg, name)
    version = f.get('version', '?')
    category = f.get('category') or 'other'
    aliases = f.get('aliases') or []
    outputs = f.get('output') or []
    if not isinstance(outputs, list):
        outputs = [outputs]
    unwrap = f.get('unwrap')
    brackets = f.get('brackets')

    L = []
    ap = L.append
    ap(f'# {name}')
    ap('')
    ap(f'> {f.get("description") or "No description provided."}')
    ap('')
    # quick facts
    flags = []
    if src and src.get('experimental'): flags.append('⚠️ **experimental**')
    if src and src.get('deprecated'): flags.append('🚫 **deprecated**')
    if aliases: flags.append(f'aliases: {", ".join(aliases)}')
    facts = ' · '.join(flags)
    ap('| Package | Category | Since | Brackets | Unwrap | Output |')
    ap('|---|---|---|---|---|---|')
    ap(f'| {pkg} | `{category}` | v{version} | {brackets_text(brackets)} | {"yes" if unwrap else "no"} | {", ".join(f"`{o}`" for o in outputs) if outputs else "—"} |')
    if facts:
        ap('')
        ap(fact_line(facts))
    ap('')

    # signature
    ap('## Signature')
    ap('')
    ap('```fs')
    ap(fs_sig(f))
    ap('```')
    if args:
        ap('')
        ap('Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.')
    ap('')

    # parameters
    if args:
        ap('## Parameters')
        ap('')
        ap('| # | Name | Type | Required | Rest | Description |')
        ap('|---|---|---|---|---|---|')
        for i, a in enumerate(args, 1):
            ap(f"| {i} | `{a['name']}` | `{a.get('type','Unknown')}` | {'**yes**' if a.get('required') else 'no'} | {'yes' if a.get('rest') else 'no'} | {md_escape_table(a.get('description') or '')} |")
        ap('')
        ap('### Per-parameter notes')
        ap('')
        for i, a in enumerate(args, 1):
            t = a.get('type', 'Unknown')
            guide = TYPE_GUIDE.get(t, (t.lower(), ''))
            n = a['name']
            ap(f"- **`{n}`** (`{t}`{' , rest' if a.get('rest') else ''}{', required' if a.get('required') else ', optional'}): {md_escape_table(a.get('description') or '')}. Expects {guide[0]}. {guide[1]}")
            if not unwrap:
                ap(f"  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.")
            if a.get('condition'):
                ap(f"  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `\"true\"`.")
            if t in ('Role', 'Member', 'Message', 'Reaction', 'AutomodRule', 'ScheduledEvent', 'SoundboardSound', 'StageInstance', 'ForumTag', 'RoleOrUser') :
                ap(f"  - This argument is resolved against a previously resolved argument (its \"pointer\") or the current context — order of arguments matters.")
        ap('')

    # how it works
    ap('## How it works')
    ap('')
    intro = CATEGORY_INTRO.get(category, CATEGORY_INTRO_DEFAULT)
    ap(intro)
    ap('')
    if unwrap:
        ap(f'`{name}` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).')
    else:
        ap(f'`{name}` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).')
    ap('')
    if not args:
        btxt = brackets_text(brackets)
        ap(f'This function takes no arguments ({btxt}).')
        ap('')
    if any(a.get('rest') for a in args):
        ra = next(a for a in args if a.get('rest'))
        ap(f'The `{ra["name"]}` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).')
        ap('')

    # examples
    ap('## Examples')
    ap('')
    examples = CURATED.get(name)
    if examples:
        for title, code in examples:
            ap(f'**{title}**')
            ap('')
            ap('```fs')
            ap(code)
            ap('```')
            ap('')
    else:
        vals = [placeholder_for(a) for a in args]
        if not args:
            ap('```fs')
            ap(name)
            ap('```')
            ap('')
        else:
            minimal = args
            n_req = sum(1 for a in args if a.get('required'))
            # basic: required args only
            basic_vals = []
            idx = 0
            for a in args:
                idx += 1
                basic_vals.append(placeholder_for(a))
                if idx >= n_req and not a.get('rest'):
                    break
            if n_req == 0:
                basic_vals = [placeholder_for(args[0])]
            basic_code = f"{name}[{';'.join(basic_vals)}]"
            full_code = f"{name}[{';'.join(vals)}]"
            ap('**Basic usage**')
            ap('')
            ap('```fs')
            ap(basic_code)
            ap('```')
            ap('')
            if full_code != basic_code:
                ap('**Full form (all arguments)**')
                ap('')
                ap('```fs')
                ap(full_code)
                ap('```')
                ap('')

    # behavior from source
    if src and src.get('execute'):
        ex = src['execute'].rstrip()
        ap('## Reference implementation (source)')
        ap('')
        ap(f'Taken from `{src["file"]}` in the `{pkg}` repository — this is exactly what runs:')
        ap('')
        ap('```ts')
        ap(ex)
        ap('```')
        ap('')

    # quirks
    ap('## Quirks & gotchas')
    ap('')
    qno = 1
    def q(text):
        nonlocal qno
        ap(f'{qno}. {text}')
        qno += 1
    if aliases:
        q(f'Callable by its aliases too: {", ".join(f"`{a}`" for a in aliases)} — function names are case-insensitive.')
    if not unwrap:
        q('Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.')
    if brackets is True and args:
        q('Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").')
    if brackets is False:
        q('Brackets are OPTIONAL — the function works with or without `[...]`.')
    if brackets is None:
        q('This function has no brackets — it is used bare.')
    opt_args = [a for a in args if not a.get('required') and not a.get('rest')]
    if opt_args:
        q(f'Optional arguments ({", ".join(f"`{a['name']}`" for a in opt_args)}) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).')
    if any(a.get('type') == 'Boolean' for a in args):
        q('Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.')
    snow_types = {'Channel','TextChannel','User','Member','Role','Message','Guild','Webhook','Sticker','Invite','GuildEmoji','ApplicationEmoji','AutomodRule','ScheduledEvent','SoundboardSound'}
    if any((a.get('type') or '') in snow_types for a in args):
        q('Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.')
    if any((a.get('type') or '') == 'URL' for a in args):
        q('URL arguments must start with `https://` — plain `http://` fails the built-in URL check.')
    if any((a.get('type') or '') == 'Time' for a in args):
        q('Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.')
    if src and src.get('experimental'):
        q('Marked **experimental** in source — behavior may change without a major version bump.')
    if src and src.get('deprecated'):
        q('Marked **deprecated** in source — migrate away from this function.')
    if 'Unknown' in outputs:
        q('Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.')
    for _vq in VERIFIED_QUIRKS.get(name.lstrip('$'), []):
        q(_vq)
    if not qno:
        q('No known quirks beyond the general semantics.')
    q('Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).')
    q('Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.') 
    ap('')

    # related
    siblings = cat_lookup.get((pkg, category), [])
    rel = [s for s in siblings if s != name][:8]
    if rel:
        ap('## Related functions')
        ap('')
        for r in rel:
            ap(link_function(pkg, r, category, out_rel_prefix))
        ap('')
    g = guides_for('function', name)
    if g:
        ap('## Community guides covering this function')
        ap('')
        for gg in g:
            url = gg.get('url') or f'https://docs.botforge.org/guide/guide-{gg["id"]}'
            ap(f"- [{gg.get('targetName')} guide]({out_rel_prefix}guides/guide-{gg['id']}.md) — [docs.botforge.org]({url})")
        ap('')
    if src:
        owner = next((e['githubPackageOwner'] for e in REGISTRY if e.get('packageName') == pkg), '')
        repo = next((e['githubPackageName'] for e in REGISTRY if e.get('packageName') == pkg), '')
        ap(f'**Source:** [`{src["file"]}`](https://github.com/{owner}/{repo}/blob/main/{src["file"]})')
        ap('')
    return '\n'.join(L)

def brackets_text(b):
    if b is True: return 'required'
    if b is False: return 'optional'
    return 'none'

def fact_line(facts):
    return f'> {facts}'

def fn_rel_path(pkg, name, category):
    """Path of a function file relative to knowledge root."""
    if pkg == CORE_PKG:
        return f'functions/{category or "other"}/{name}.md'
    return f'extensions/{SLUGS[pkg]}/functions/{name}.md'

def link_function(pkg, name, category, from_prefix):
    """Markdown link to a function file. Related functions always share the same folder."""
    return f'- [`{name}`]({name}.md)'

# ---------------------------------------------------------------- event / enum renderers

PRIVILEGED_INTENTS = {'MessageContent', 'GuildMembers', 'GuildPresences', 'DirectMessageTyping', 'GuildMessageTyping'}

def render_event_md(pkg, ev, all_events, root_prefix='../'):
    name = ev['name']
    intents = ev.get('intents') or []
    L = []
    ap = L.append
    ap(f'# {name}')
    ap('')
    ap(f'> {ev.get("description") or "No description provided."}')
    ap('')
    ap('| Package | Since | Intents required |')
    ap('|---|---|---|')
    priv = [i for i in intents if i in PRIVILEGED_INTENTS]
    ap(f'| {pkg} | v{ev.get("version","?")} | {", ".join(f"`{i}`" for i in intents) if intents else "—"} |')
    ap('')
    if priv:
        ap(f'> ⚠️ Privileged intent(s): {", ".join(f"`{p}`" for p in priv)} — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.')
        ap('')
    ap('## Registering')
    ap('')
    ap(f'Enable `{name}` in the client\'s `events` array, then create an event file:')
    ap('')
    ap('```js')
    ap('const { ForgeClient } = require("@tryforge/forgescript")')
    ap('')
    ap('const client = new ForgeClient({')
    ap('    intents: [' + ', '.join(f'"{i}"' for i in intents) + '],')
    ap('    events: ["' + name + '"],')
    ap('    prefixes: ["!"]')
    ap('})')
    ap('```')
    ap('')
    ap('```js')
    ap(f'// events/{name}.js')
    ap('module.exports = {')
    ap(f'    type: "{name}",')
    ap(f'    code: `$log[{name} fired!]`'.replace('{name} fired!', name + ' fired!'))
    ap('}')
    ap('```')
    ap('')
    ap('## Context data available')
    ap('')
    h = HANDLERS.get(name)
    if h:
        if h.get('obj'):
            ap(f"- **Triggering entity (`obj`)**: `{h['obj']}` — the runtime object context functions resolve against.")
        if h.get('states'):
            ap('- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:')
            ap('')
            ap('  | Entity | old | new | Accessors |')
            ap('  |---|---|---|---|')
            for k, v in h['states'].items():
                old_a, new_a = STATE_ACCESSORS.get(k, (None, None))
                accs = [a for a, present in ((old_a, v['old']), (new_a, v['new'])) if a and present]
                acc = ', '.join(f'`{a}`' for a in accs) if accs else '—'
                ap(f"  | `{k}` | {'yes' if v['old'] else '—'} | {'yes' if v['new'] else '—'} | {acc} |")
            ap('')
        else:
            ap("- No old/new states — this event fires with a single fresh entity.")
        if h.get('args'):
            ap(f"- **`$message[N]` args**: seeded by this event (`{h['args']}`).")
        else:
            ap("- `$message[N]` args: not seeded by this event (empty).")
        for sp in h.get('special', []):
            ap(f"- ⚙️ {sp}")
    else:
        ap('Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).')
    ap('')
    cur = EVENT_CURATED.get(name)
    if cur:
        ap('## Example')
        ap('')
        ap(f'**{cur[0]}**')
        ap('')
        ap('```js')
        ap(cur[1])
        ap('```')
        ap('')
    g = guides_for('event', name)
    if g:
        ap('## Community guides')
        ap('')
        for gg in g:
            url = gg.get('url') or f'https://docs.botforge.org/guide/guide-{gg["id"]}'
            ap(f'- [{name} guide]({root_prefix}guides/guide-{gg["id"]}.md) — [docs.botforge.org]({url})')
        ap('')
    others = [e['name'] for e in all_events if e['name'] != name][:8]
    if others:
        ap('## Related events')
        ap('')
        for o in others:
            ap(f'- [`{o}`]({o}.md)')
        ap('')
    return '\n'.join(L)

ENUM_NOTES = {
    'ActivityType': 'Discord presence activity kinds: `Playing`/`Streaming`/`Listening`/`Watching`/`Competing` map to discord.js `ActivityType` values; `Custom` is the custom status type.',
    'Status': 'Presence statuses used by `$setPresence`-style functions: `online`, `idle`, `dnd`, `invisible`, ...',
    'SortType': '`asc` (ascending) / `desc` (descending) — used by sorting and variable-query functions.',
    'AutoModerationActionType': 'What an automod rule does when triggered (block message, send alert message, timeout user).',
    'AutoModerationRuleTriggerType': 'What causes an automod rule to trigger (keyword, keyword preset, mention spam, ...).',
    'AuditLogEvent': 'Discord audit-log action names, mirrored from discord.js (`GuildUpdate`, `MemberKick`, `RoleCreate`, ...). Used as the action filter of audit-log functions.',
    'PermissionFlagsBits': 'The full camelCase permission-name list used by permission arguments everywhere.',
}

def render_enum_md(pkg, enum_name, values, cat_lookup=None):
    L = []
    ap = L.append
    ap(f'# {enum_name}')
    ap('')
    ap(f'Enum defined by **{pkg}** with `{len(values)}` values.')
    note = ENUM_NOTES.get(enum_name)
    if note:
        ap('')
        ap(f'> {note}')
    ap('')
    ap('## Values')
    ap('')
    ap('| Value | Index |')
    ap('|---|---|')
    for i, v in enumerate(values):
        ap(f'| `{v}` | {i} |')
    ap('')
    if pkg == CORE_PKG and cat_lookup:
        core_names = {}
        for (p_, c_), names_ in cat_lookup.items():
            if p_ == CORE_PKG:
                for n in names_:
                    core_names[n] = c_
        consumers = ENUM_USAGE.get(enum_name) or []
        if consumers:
            ap('## Used by')
            ap('')
            for fn_name in consumers[:25]:
                cat = core_names.get(fn_name)
                if cat:
                    ap(f'- [`{fn_name}`](../functions/{cat}/{fn_name}.md)')
                else:
                    ap(f'- `{fn_name}`')
            if len(consumers) > 25:
                ap(f'- … and {len(consumers)-25} more')
            ap('')
    ap('## Usage')
    ap('')
    ap('Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.')
    ap('')
    return '\n'.join(L)

# ---------------------------------------------------------------- guide renderer

def render_guide_md(g):
    L = []
    ap = L.append
    tid = g.get('title') or (f"{g.get('targetName','')} guide" if g.get('targetType') else 'Guide')
    ap(f'# {tid}')
    ap('')
    tgt = g.get('targetType')
    tn = g.get('targetName')
    url = g.get('url') or f'https://docs.botforge.org/guide/guide-{g.get("id")}'
    if tgt:
        ap(f"> Community guide for `{tn}` ({tgt}) — package **{g.get('packageName')}**. Approved {g.get('approvedAt','?')[:10]}. [View on docs.botforge.org]({url})")
    else:
        ap(f"> Community guide — package **{g.get('packageName')}**. Approved {g.get('approvedAt','?')[:10]}. [View on docs.botforge.org]({url})")
    ap('')
    content = (g.get('content') or '').strip()
    content = content.replace('\r\n', '\n')
    ap(content)
    ap('')
    return '\n'.join(L)

# ---------------------------------------------------------------- extension renderer

def render_extension_readme(pkg):
    e = next((x for x in REGISTRY if x.get('packageName') == pkg), None)
    if not e:
        return f'# {pkg}\n\n(no registry data)\n'
    slug = SLUGS[pkg]
    L = []
    ap = L.append
    npm = e.get('npmPackageName')
    owner = e.get('githubPackageOwner')
    repo = e.get('githubPackageName')
    official = e.get('official')
    ap(f'# {pkg}')
    ap('')
    ap(f'> {e.get("packageDescription") or "No description."}')
    ap('')
    ap('| | |')
    ap('|---|---|')
    ap(f'| Type | {"Official extension" if official else "Community extension"}{" · verified" if e.get("verified") else ""} |')
    ap(f'| GitHub | https://github.com/{owner}/{repo} |')
    if npm:
        ap(f'| npm | `{npm}` (`npm i {npm}`) |')
    ap(f'| Lead dev | {e.get("leadDev") or e.get("authorName") or "?"} |')
    ap(f'| Main branch | `{e.get("mainBranch") or "main"}` |')
    ap(f'| Docs page | https://docs.botforge.org/?p={pkg.replace(' ', '+')} |')
    ap('')
    fns = load_meta(pkg, 'functions') or []
    evs = load_meta(pkg, 'events') or []
    ens = load_meta(pkg, 'enums') or []
    ap('## Contents')
    ap('')
    if pkg == CORE_PKG:
        ap('ForgeScript is the core package — its functions, events and enums live at the top level of this knowledge folder:')
        ap('')
        ap('- [`functions/`](../../functions/_INDEX.md) — all ForgeScript functions by category')
        ap('- [`events/`](../../events/_INDEX.md) — ForgeScript events')
        ap('- [`enums/`](../../enums/_INDEX.md) — ForgeScript enums')
    else:
        if fns: ap(f'- [`functions/`](functions/_INDEX.md) — {len(fns)} functions')
        if evs: ap(f'- [`events/`](events/_INDEX.md) — {len(evs)} events')
        if ens: ap(f'- [`enums/`](enums/_INDEX.md) — {len(ens)} enums')
    ap('')
    cl = load_meta(pkg, 'changelogs')
    if cl and isinstance(cl, dict):
        ap('## Changelog summary')
        ap('')
        ap('| Version | Changes |')
        ap('|---|---|')
        for ver in sorted(cl.keys(), reverse=True)[:12]:
            def msg(c):
                return c.get('message', '') if isinstance(c, dict) else str(c)
            msgs = '<br>'.join(md_escape_table(msg(c)) for c in cl[ver][:8])
            ap(f'| {ver} | {msgs} |')
        ap('')
        ap(f'Full changelog: [`CHANGELOG.md`](CHANGELOG.md)')
        ap('')
    if pkg != CORE_PKG:
        readme = load_readme(pkg)
        if readme:
            ap('---')
            ap('')
            ap('## Package README (verbatim from GitHub)')
            ap('')
            ap(readme.rstrip())
            ap('')
    return '\n'.join(L)

def render_changelog_md(pkg):
    cl = load_meta(pkg, 'changelogs')
    if not cl:
        return None
    L = [f'# {pkg} — full changelog', '']
    for ver in sorted(cl.keys(), key=lambda v: [int(x) if x.isdigit() else 0 for x in v.split('.')], reverse=True):
        L.append(f'## {ver}')
        L.append('')
        for c in cl[ver]:
            L.append(f"- {c.get('message','') if isinstance(c, dict) else c}")
        L.append('')
    return '\n'.join(L)

# ---------------------------------------------------------------- main build

def build_pkg_functions(pkg):
    fns = load_meta(pkg, 'functions') or []
    cat_lookup = {}
    for f in fns:
        cat_lookup.setdefault((pkg, f.get('category') or 'other'), []).append(f['name'])
    return fns, cat_lookup

def main():
    total = {'functions': 0, 'events': 0, 'enums': 0, 'guides': len(GUIDES), 'files': 0}

    # ---- core package (ForgeScript) at top level
    fns, cat_lookup = build_pkg_functions(CORE_PKG)
    os.makedirs(f'{OUT}/functions', exist_ok=True)
    for f in fns:
        cat = (f.get('category') or 'other').replace(' ', '-')
        d = f'{OUT}/functions/{cat}'
        os.makedirs(d, exist_ok=True)
        path = f'{d}/{f["name"]}.md'
        open(path, 'w', encoding='utf-8').write(render_function_md(CORE_PKG, f, cat_lookup, '../../'))
        total['functions'] += 1
        # alias stubs
        for a in (f.get('aliases') or []):
            stub = f'# {a}\n\n> Alias of [`{f["name"]}`]({f["name"]}.md).\n\nSee [{f["name"]}]({f["name"]}.md) for full documentation.\n'
            open(f'{d}/{a}.md', 'w', encoding='utf-8').write(stub)
            total['functions'] += 1

    # functions index
    with open(f'{OUT}/functions/_INDEX.md', 'w', encoding='utf-8') as fh:
        fh.write('# ForgeScript functions — index\n\n')
        n_aliases = sum(len(f.get('aliases') or []) for f in fns)
        fh.write(f'{len(fns)} functions (+{n_aliases} aliases, each with its own stub page) across {len(set((f.get("category") or "other") for f in fns))} categories.\n\n')
        cats = sorted(set((f.get('category') or 'other') for f in fns))
        for c in cats:
            names = sorted(cat_lookup.get((CORE_PKG, c), []))
            fh.write(f'## {c} ({len(names)})\n\n')
            for n in names:
                f = next(x for x in fns if x['name'] == n)
                fh.write(f'- [`{n}`]({c.replace(" ", "-")}/{n}.md) — {f.get("description") or ""}\n')
                for a in sorted(f.get('aliases') or []):
                    fh.write(f'- [`{a}`]({c.replace(" ", "-")}/{a}.md) — Alias of `{n}`\n')
            fh.write('\n')
    total['files'] = total['functions'] + 1

    # ---- events
    evs = load_meta(CORE_PKG, 'events') or []
    os.makedirs(f'{OUT}/events', exist_ok=True)
    for ev in evs:
        open(f'{OUT}/events/{ev["name"]}.md', 'w', encoding='utf-8').write(render_event_md(CORE_PKG, ev, evs, '../'))
        total['events'] += 1
    with open(f'{OUT}/events/_INDEX.md', 'w', encoding='utf-8') as fh:
        fh.write('# ForgeScript events — index\n\n')
        for ev in sorted(evs, key=lambda x: x['name']):
            fh.write(f'- [`{ev["name"]}`]({ev["name"]}.md) — {ev.get("description") or ""}\n')
    total['files'] += total['events'] + 1

    # ---- enums
    ens = load_meta(CORE_PKG, 'enums') or {}
    os.makedirs(f'{OUT}/enums', exist_ok=True)
    for ename, values in ens.items():
        open(f'{OUT}/enums/{ename}.md', 'w', encoding='utf-8').write(render_enum_md(CORE_PKG, ename, values, cat_lookup))
        total['enums'] += 1
    with open(f'{OUT}/enums/_INDEX.md', 'w', encoding='utf-8') as fh:
        fh.write('# ForgeScript enums — index\n\n')
        for ename in sorted(ens):
            fh.write(f'- [`{ename}`]({ename}.md) — {len(ens[ename])} values\n')
    total['files'] += total['enums'] + 1

    # ---- guides
    os.makedirs(f'{OUT}/guides', exist_ok=True)
    for g in GUIDES:
        tid = g.get('title') or g.get('targetName') or 'guide'
        fnm = f'guide-{g["id"]}.md'
        open(f'{OUT}/guides/{fnm}', 'w', encoding='utf-8').write(render_guide_md(g))
    with open(f'{OUT}/guides/_INDEX.md', 'w', encoding='utf-8') as fh:
        fh.write('# Community guides — index\n\n')
        fh.write(f'{len(GUIDES)} approved guides from docs.botforge.org, with full content.\n\n')
        for g in sorted(GUIDES, key=lambda x: (x.get('packageName') or '', x.get('targetType') or '', x.get('targetName') or '')):
            tid = g.get('title') or f'{g.get("targetName","")} ({g.get("targetType","")})'
            fh.write(f'- [guide-{g["id"]} — {tid}](guide-{g["id"]}.md) — {g.get("packageName")} · approved {str(g.get("approvedAt"))[:10]}\n')
    total['files'] += len(GUIDES) + 1

    # ---- changelog (per-version: changelog messages + functions/events introduced)
    cl = load_meta(CORE_PKG, 'changelogs') or {}
    ver_key = lambda v: [int(x) if x.isdigit() else 0 for x in str(v).split('.')]
    fn_by_ver, ev_by_ver = {}, {}
    for f in fns:
        fn_by_ver.setdefault(f.get('version', '?'), []).append(f['name'])
    for ev in evs:
        ev_by_ver.setdefault(ev.get('version', '?'), []).append(ev['name'])
    all_versions = sorted(set(list(cl.keys()) + list(fn_by_ver) + list(ev_by_ver)), key=ver_key, reverse=True)
    os.makedirs(f'{OUT}/changelog', exist_ok=True)
    for v in all_versions:
        f_here = sorted(fn_by_ver.get(v, []))
        e_here = sorted(ev_by_ver.get(v, []))
        msgs = cl.get(v) or []
        L = [f'# v{v}', '']
        if msgs:
            L.append('## Changelog')
            L.append('')
            for c in msgs:
                L.append(f"- {c.get('message','') if isinstance(c, dict) else c}")
            L.append('')
        if f_here:
            L.append(f'## Functions introduced in v{v} ({len(f_here)})')
            L.append('')
            name_to_cat = {f['name']: (f.get('category') or 'other') for f in fns}
            for n in f_here:
                cat = name_to_cat.get(n, 'other')
                L.append(f'- [`{n}`](../functions/{cat}/{n}.md)')
            L.append('')
        if e_here:
            L.append(f'## Events introduced in v{v} ({len(e_here)})')
            L.append('')
            for n in e_here:
                L.append(f'- [`{n}`](../events/{n}.md)')
            L.append('')
        if not msgs and not f_here and not e_here:
            L.append('_No recorded changes._')
            L.append('')
        open(f'{OUT}/changelog/v{v}.md', 'w', encoding='utf-8').write('\n'.join(L))
    with open(f'{OUT}/changelog/_INDEX.md', 'w', encoding='utf-8') as fh:
        fh.write('# ForgeScript changelog — index\n\n')
        fh.write(f'{len(all_versions)} versions, derived from the official changelog metadata **plus** the "since" version recorded on every function and event — richer than the docs site\'s changelog tab, which only shows the message lists.\n\n')
        fh.write('| Version | Changelog entries | Functions added | Events added |\n|---|---|---|---|\n')
        for v in all_versions:
            fh.write(f"| [v{v}](v{v}.md) | {len(cl.get(v) or [])} | {len(fn_by_ver.get(v, []))} | {len(ev_by_ver.get(v, []))} |\n")
    total['files'] += len(all_versions) + 1

    # ---- extensions
    os.makedirs(f'{OUT}/extensions', exist_ok=True)
    ext_stats = {}
    for pkg in PACKAGES:
        slug = SLUGS.get(pkg)
        if not slug:
            continue
        d = f'{OUT}/extensions/{slug}'
        os.makedirs(d, exist_ok=True)
        open(f'{d}/README.md', 'w', encoding='utf-8').write(render_extension_readme(pkg))
        ch = render_changelog_md(pkg)
        if ch:
            open(f'{d}/CHANGELOG.md', 'w', encoding='utf-8').write(ch)
        stats = {'functions': 0, 'events': 0, 'enums': 0}
        if pkg != CORE_PKG:
            fns = load_meta(pkg, 'functions') or []
            _, cat_lookup_e = build_pkg_functions(pkg)
            if fns:
                os.makedirs(f'{d}/functions', exist_ok=True)
                for f in fns:
                    open(f'{d}/functions/{f["name"]}.md', 'w', encoding='utf-8').write(
                        render_function_md(pkg, f, cat_lookup_e, '../../../'))
                    stats['functions'] += 1
                    for a in (f.get('aliases') or []):
                        stub = f'# {a}\n\n> Alias of [`{f["name"]}`]({f["name"]}.md).\n'
                        open(f'{d}/functions/{a}.md', 'w', encoding='utf-8').write(stub)
                        stats['functions'] += 1
                with open(f'{d}/functions/_INDEX.md', 'w', encoding='utf-8') as fh:
                    fh.write(f'# {pkg} functions — index\n\n')
                    for f in sorted(fns, key=lambda x: x['name']):
                        fh.write(f'- [`{f["name"]}`]({f["name"]}.md) — {f.get("description") or ""}\n')
                        for a in sorted(f.get('aliases') or []):
                            fh.write(f'- [`{a}`]({a}.md) — Alias of `{f["name"]}`\n')
            evs = load_meta(pkg, 'events') or []
            if evs:
                os.makedirs(f'{d}/events', exist_ok=True)
                for ev in evs:
                    open(f'{d}/events/{ev["name"]}.md', 'w', encoding='utf-8').write(render_event_md(pkg, ev, evs, '../../../'))
                    stats['events'] += 1
                with open(f'{d}/events/_INDEX.md', 'w', encoding='utf-8') as fh:
                    fh.write(f'# {pkg} events — index\n\n')
                    for ev in sorted(evs, key=lambda x: x['name']):
                        fh.write(f'- [`{ev["name"]}`]({ev["name"]}.md) — {ev.get("description") or ""}\n')
            ens = load_meta(pkg, 'enums') or {}
            if ens:
                os.makedirs(f'{d}/enums', exist_ok=True)
                for ename, values in ens.items():
                    open(f'{d}/enums/{ename}.md', 'w', encoding='utf-8').write(render_enum_md(pkg, ename, values))
                    stats['enums'] += 1
                with open(f'{d}/enums/_INDEX.md', 'w', encoding='utf-8') as fh:
                    fh.write(f'# {pkg} enums — index\n\n')
                    for ename in sorted(ens):
                        fh.write(f'- [`{ename}`]({ename}.md) — {len(ens[ename])} values\n')
        ext_stats[pkg] = stats
    # core package stats live at top level; mirror them so build_stats is self-consistent
    ext_stats[CORE_PKG] = {'functions': total['functions'], 'events': total['events'], 'enums': total['enums']}

    # extensions index
    with open(f'{OUT}/extensions/_INDEX.md', 'w', encoding='utf-8') as fh:
        fh.write('# Extensions — index\n\n')
        for e in REGISTRY:
            pkg = e.get('packageName')
            slug = SLUGS.get(pkg)
            if not slug:
                continue
            kind = 'official' if e.get('official') else 'community'
            fh.write(f'- [`{pkg}`]({slug}/README.md) — {kind} · {(e.get("packageDescription") or "")[:110]}\n')

    json.dump({'total': total, 'ext_stats': ext_stats}, open(f'{CACHE}/build_stats.json', 'w'), indent=1)
    print(json.dumps({'total': total, 'ext_stats': ext_stats}, indent=1))

if __name__ == '__main__':
    main()
