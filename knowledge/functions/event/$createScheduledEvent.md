# $createScheduledEvent

> Creates a new scheduled event on a guild, returns event id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `event` | v2.6.0 | required | yes | `ScheduledEvent` |

## Signature

```fs
$createScheduledEvent[guild ID;name;description;type;start;end;cover]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to create scheduled event on |
| 2 | `name` | `String` | **yes** | no | The name of the scheduled event |
| 3 | `description` | `String` | no | no | The description of the scheduled event |
| 4 | `type` | `Enum` | **yes** | no | The entity type of the scheduled event |
| 5 | `start` | `Date` | **yes** | no | The start time of the scheduled event |
| 6 | `end` | `Date` | no | no | The end time of the scheduled event |
| 7 | `cover` | `URL` | no | no | The cover image of the scheduled event |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to create scheduled event on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`name`** (`String`, required): The name of the scheduled event. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The description of the scheduled event. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, required): The entity type of the scheduled event. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`start`** (`Date`, required): The start time of the scheduled event. Expects a date. A unix timestamp in milliseconds (number) or any string the JS `Date` constructor understands (`2024-01-01`, ISO strings, ...).
- **`end`** (`Date`, optional): The end time of the scheduled event. Expects a date. A unix timestamp in milliseconds (number) or any string the JS `Date` constructor understands (`2024-01-01`, ISO strings, ...).
- **`cover`** (`URL`, optional): The cover image of the scheduled event. Expects a URL. Must match `https://...` — plain `http://` URLs FAIL the built-in check (regex is `^http?s:\/\/`, which effectively requires the `s`). A Discord custom emoji string is also accepted and auto-converted to its CDN URL.

## How it works

Event functions (re)schedule guild scheduled events and set their channel/location metadata.

`$createScheduledEvent` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createScheduledEvent[123456789012345678;name;value;value]
```

**Full form (all arguments)**

```fs
$createScheduledEvent[123456789012345678;name;value;value;1710000000000;1710000000000;https://example.com]
```

## Reference implementation (source)

Taken from `src/native/event/createScheduledEvent.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const event = await guild.scheduledEvents.create({
            name,
            entityType: type,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            scheduledStartTime: start,
            scheduledEndTime: end || undefined,
            description: desc || undefined,
            image: cover || undefined,
            channel: ctx.scheduledEvent.channel,
            entityMetadata: ctx.scheduledEvent.entityMetadata,
            reason: ctx.reason
        }).catch(ctx.noop)

        ctx.clearScheduledEventOptions()

        return this.success(event?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`description`, `end`, `cover`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. URL arguments must start with `https://` — plain `http://` fails the built-in URL check.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteScheduledEvent`]($deleteScheduledEvent.md)
- [`$editScheduledEvent`]($editScheduledEvent.md)
- [`$getScheduledEvent`]($getScheduledEvent.md)
- [`$setScheduledEventChannel`]($setScheduledEventChannel.md)
- [`$setScheduledEventLocation`]($setScheduledEventLocation.md)

**Source:** [`src/native/event/createScheduledEvent.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/event/createScheduledEvent.ts)
