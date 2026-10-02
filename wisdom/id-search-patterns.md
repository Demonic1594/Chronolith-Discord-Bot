# ID-search patterns — UI composition, dual triggers, and chain assembly

> Source: `../../code/id-search/` (fetched 2026-09-26). All 69 functions verified against core metadata — zero gaps; the wins here are *composition* semantics.

## Pattern 1: Components V2 output — the modern message shape

This code doesn't use classic embeds (`$title`/`$description`) at all. It builds **layout containers**:

- `$addContainer[components*; color?; spoiler?]` — a V2 container with an accent color (the trailing `;$get[color]` / `;#ff0000` args).
- Inside: `$addTextDisplay` (supports full markdown incl. `##` headers, subtext `-#`, bold), `$addSeparator`, `$addSection[accessory + content]` (accessory first: `$addThumbnail[...]` before the text displays), `$addActionRow` + `$addButton`.

Wisdom: the container family is the current output model for rich UIs; classic embed functions remain valid but containers compose better (mixed text/buttons per section). Real code keeps a `$let[color;...]` theming variable and passes it as the container accent — a cheap design system.

## Pattern 2: the mention-join separator trick

```fs
<@&$memberRoles[$guildID;$get[inq];, <@&]>
<@$roleMembers[$guildID;$get[inq];, <@]>
```

`$memberRoles[guild;user;separator]` returns role IDs joined by the separator. Injecting `, <@&` as the separator and wrapping with a leading `<@&` + trailing `>` mention-ifies the entire list. This is the canonical way to render "all roles" / "all members" as mentions without array iteration. (Watch the `$nomention` toggle nearby when rendering role mentions in normal output — here it suppresses the ping side-effect.)

## Pattern 3: `$ifx` is a chain assembler, not a block

```fs
$ifx[
$if[$userExists[$get[inq]];$let[type;user]]
$elseIf[$channelExists[$get[inq]];$let[type;channel]]
$elseIf[$emojiExists[$get[inq]];$let[type;emoji]]
$elseIf[$roleExists[$guildID;$get[inq]];$let[type;role]]
$else[$let[type;none]]
]
```

Source-verified: `$ifx[block]` scans its raw code for the `$if`, every `$elseIf`, and the `$else` **as siblings** and runs them as one chain — first truthy branch wins, untaken `$if` returns null so the chain proceeds. This is the natural multi-way dispatch in ForgeScript, cleaner than nested `$if[$if[...]]`. (Both real systems I've audited lean on it heavily; it's experimental in source — treat semantics as soft-pinned.)

## Pattern 4: one body, two triggers

Prefix and slash files share a near-identical body; the only divergence is input capture: `$message[0]` (prefix) vs `$option[id]` (slash). The timeout system's `$default[$option[page];$message[0]]` is the unified-single-file variant. Wisdom: write the body once around a `$let[inq;...]` seam, then duplicate only the capture line per trigger type.

Bonus verified quirk: `$option[name]` returns `attachment.url ?? value` — attachment-type slash options hand you the file URL directly.

## Pattern 5: CustomID routing, minimalist variant

No `allowedInteractionTypes` here (contrast the timeout system) — the interaction handler self-filters:

```fs
$arrayLoad[id;-;$customID]
$onlyIf[$arrayAt[id;0]==idSearch]
```

CustomID contract: `idSearch-<action>-<snowflake>` — `-` delimiter is safe because actions and snowflakes contain no `-`. Same envelope idea as the timeout system's scheme, minus the author check (fine for read-only ephemeral replies; add the author segment if actions mutate anything).

## Small confirmations worth keeping

- `$message` is **0-based over user args** (command name already stripped by the messageCreate handler) — `$message[0]` = first argument.
- `$parseDate[ms;LocaleDate]` — enum-styled date formatting pairs with the various `*CreatedAt`/`*JoinedAt` ms functions.
- `$rolePosition[guild;role;true]` — third arg "asc order" flips ordering direction.
- `$channelPosition` is 0-based → `$sum[$channelPosition[id];1]` humanizes.
- `$replace[$channelType;Guild;]` — cosmetic prefix stripping of the `Guild*` enum names `$channelType` emits.
- Graceful degradation branches everywhere: member-not-in-server, no-category channels, no-topic channels — each renders an inline fallback instead of erroring. This is why the command survives bad input without `$try`.
- Command-file fields used: `aliases`, `usage`, `description`, `category` (metadata for help systems) — harmless extras beyond name/type/code.

## Version watch

`integration_types`/`contexts` in `data` = user-installable app support; older bot code omitting them defaults to guild-only behavior. `$ifx` and the container family are the pieces most likely to drift — recheck after `refresh.sh`.

## Additions from the community field study (2026-09-28)

- **`allowedInteractionTypes` + CustomID author-lock** (Dodo-Bot): `type: "interactionCreate"`, `allowedInteractionTypes: ["selectMenu"]` filters the component type at the handler level; then `namespace_$authorID` CustomIDs parsed with `$advancedTextSplit[$customID;_;0/1]`, second field checked against `$authorID` — "You're not the author of this interaction." The two mechanisms together stop interaction hijacking completely. A `~` separator variant (Akira modals) does the same for `$modal` CustomIDs.
- **The DM trick — guild ID inside the CustomID** (Chronolith local): in DM interactions `$guildID` is empty, so a DM-reachable button (`verify-<guildID>-<userID>`) carries the guild ID *in the CustomID itself* — the only way to recover guild context from a DM component. General rule: anything that must round-trip through a DM component belongs in the CustomID, not in context.
- **Nameless unprefixed commands as background automations** (ayra): `name: ""` + `unprefixed: false` makes a command fire on every message without a prefix — sticky-message (delete-last-then-repost keyed on a var) and starboard (`messageReactionAdd` + `$reactionEmoji` gate + `$getMessageReactionCount >= threshold` + jump-link embed `https://discord.com/channels/$guildID/$channelID/$reactionMessageID`) both ride this shape in ~2 lines each.
