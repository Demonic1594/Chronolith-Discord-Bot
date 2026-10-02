#!/usr/bin/env python3
"""Extract per-event runtime facts from src/handlers/events/*.ts:
   obj entity type, states (old/new availability), args setup, special behaviors."""
import json, os, re, glob

# event-name prefix -> entity type (discord.js payload conventions)
OBJ_BY_EVENT = [
    ('messageReaction', 'MessageReaction'), ('message', 'Message'),
    ('guildMember', 'GuildMember'), ('guildBan', 'GuildBan'), ('guildScheduledEvent', 'GuildScheduledEvent'),
    ('guildCreate', 'Guild'), ('guildDelete', 'Guild'), ('guildAvailable', 'Guild'), ('guildUnavailable', 'Guild'),
    ('autoModerationRule', 'AutoModerationRule'), ('autoModerationAction', 'AutoModerationActionExecution'),
    ('channelPins', 'Channel'), ('channelCreate', 'Channel'), ('channelDelete', 'Channel'), ('channelUpdate', 'Channel'),
    ('emoji', 'GuildEmoji'), ('sticker', 'Sticker'), ('role', 'Role'), ('invite', 'Invite'),
    ('interactionCreate', 'BaseInteraction'), ('entitlement', 'Entitlement'),
    ('soundboardSound', 'SoundboardSound'), ('stageInstance', 'StageInstance'),
    ('presenceUpdate', 'Presence'), ('userUpdate', 'User'), ('voiceStateUpdate', 'VoiceState'),
    ('voiceServerUpdate', 'VoiceServerUpdateData'), ('voiceChannelEffect', 'VoiceChannelEffect'),
    ('threadCreate', 'ThreadChannel'), ('threadDelete', 'ThreadChannel'), ('threadUpdate', 'ThreadChannel'),
    ('threadListSync', 'ThreadChannel'), ('threadMemberUpdate', 'ThreadMember'), ('threadMembersUpdate', 'ThreadMember'),
    ('typing', 'Typing'), ('pollVoteAdd', 'PollVote'), ('pollVoteRemove', 'PollVote'),
    ('applicationCommandPermissionsUpdate', 'ApplicationCommandPermissions'),
]

def infer_obj(name):
    for prefix, t in OBJ_BY_EVENT:
        if name.startswith(prefix):
            return t
    return None

def extract(path):
    src = open(path, encoding='utf-8').read()
    name = re.search(r'name:\s*"(\w+)"', src)
    if not name: return None
    name = name.group(1)
    obj = re.search(r'obj:\s*([\w.]+)(?:\s+as\s+(\w+))?', src)
    obj_type = (obj.group(2) or obj.group(1)) if obj else None
    if obj_type in ('newer', 'm', 'g', 'ch', 'r', 'en', 's', 'inv', 'sub', 'now', 'i', 'c', 'old', 'data', 'typing', 'effect', 'message', 'channel', 'guild', 'user'):
        obj_type = infer_obj(name) or ('raw:' + obj_type)
    elif obj_type == '{}':
        obj_type = None
    # states block: states: { key: { old: ..., new: ... } }
    states = {}
    sm = re.search(r'states:\s*\{', src)
    if sm:
        block = src[sm.end():]
        depth = 1; i = 0
        while i < len(block) and depth:
            if block[i] == '{': depth += 1
            elif block[i] == '}': depth -= 1
            i += 1
        block = block[:i]
        for km in re.finditer(r'(\w+):\s*\{([^{}]*)\}', block):
            key, inner = km.group(1), km.group(2)
            states[key] = {'old': bool(re.search(r'\bold\b', inner)), 'new': bool(re.search(r'\bnew(er)?\b', inner))}
    args = re.search(r'args:\s*\[?\s*([^,\n\]]*)', src)
    args_val = args.group(1).strip() if args and args.group(1).strip() not in ('', '[]') else None
    special = []
    if 'respondOnEdit' in src: special.append('Re-runs messageCreate handling when the client option `respondOnEdit` is set (respecting its ms window) — edited messages can re-trigger prefix commands.')
    if 'InviteTracker' in src: special.append('Feeds the Invite Tracker (`trackers: { invites: true }`) — `$invite*` state data is available.')
    if 'VoiceTracker' in src: special.append('Feeds the Voice Tracker (`trackers: { voice: true }`).')
    if 'doNotSend' in src: special.append('Runs with output suppressed (doNotSend) — handler-style event, use explicit send functions.')
    return {'name': name, 'obj': obj_type, 'states': states, 'args': args_val, 'special': special}

def main():
    out = {}
    for p in sorted(glob.glob('/tmp/opencode/ForgeScript/src/handlers/events/*.ts')):
        try:
            e = extract(p)
            if e: out[e['name']] = e
        except Exception as ex:
            print('skip', p, ex)
    dest = '/workspace/BotForge/.knowledge-cache/handlers.json'
    json.dump(out, open(dest, 'w'), indent=1)
    print(f'{len(out)} handlers -> {dest}')
    have = json.load(open('/workspace/BotForge/.knowledge-cache/meta/ForgeScript__eventsUrl.json'))
    meta = {e['name'] for e in have}
    print('in metadata but no handler:', sorted(meta - set(out)) or 'none')
    print('handlers without metadata:', sorted(set(out) - meta) or 'none')

if __name__ == '__main__':
    main()
