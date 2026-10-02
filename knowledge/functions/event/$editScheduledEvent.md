# $editScheduledEvent

> Edits an existing scheduled event on a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `event` | v2.6.0 | required | yes | `Boolean` |

## Signature

```fs
$editScheduledEvent[guild ID;event ID;name;description;type;start;end;cover]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to edit scheduled event on |
| 2 | `event ID` | `ScheduledEvent` | **yes** | no | The scheduled event to edit |
| 3 | `name` | `String` | no | no | The new name for the scheduled event |
| 4 | `description` | `String` | no | no | The new description for the scheduled event |
| 5 | `type` | `Enum` | no | no | The new entity type for the scheduled event |
| 6 | `start` | `Date` | no | no | The new start time for the scheduled event |
| 7 | `end` | `Date` | no | no | The new end time for the scheduled event |
| 8 | `cover` | `URL` | no | no | The new cover image for the scheduled event |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to edit scheduled event on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`event ID`** (`ScheduledEvent`, required): The scheduled event to edit. Expects a scheduled event ID. Fetched from the pointer guild's scheduledEvents manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`name`** (`String`, optional): The new name for the scheduled event. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The new description for the scheduled event. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, optional): The new entity type for the scheduled event. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`start`** (`Date`, optional): The new start time for the scheduled event. Expects a date. A unix timestamp in milliseconds (number) or any string the JS `Date` constructor understands (`2024-01-01`, ISO strings, ...).
- **`end`** (`Date`, optional): The new end time for the scheduled event. Expects a date. A unix timestamp in milliseconds (number) or any string the JS `Date` constructor understands (`2024-01-01`, ISO strings, ...).
- **`cover`** (`URL`, optional): The new cover image for the scheduled event. Expects a URL. Must match `https://...` — plain `http://` URLs FAIL the built-in check (regex is `^http?s:\/\/`, which effectively requires the `s`). A Discord custom emoji string is also accepted and auto-converted to its CDN URL.

## How it works

Event functions (re)schedule guild scheduled events and set their channel/location metadata.

`$editScheduledEvent` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editScheduledEvent[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editScheduledEvent[123456789012345678;123456789012345678;name;value;value;1710000000000;1710000000000;https://example.com]
```

## Reference implementation (source)

Taken from `src/native/event/editScheduledEvent.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const edit = await event.edit({
            name: name || undefined,
            description: desc || undefined,
            entityType: type || undefined,
            scheduledStartTime: start || undefined,
            scheduledEndTime: end || undefined,
            image: cover || undefined,
            channel: ctx.scheduledEvent.channel,
            entityMetadata: ctx.scheduledEvent.entityMetadata,
            reason: ctx.reason
        }).catch(ctx.noop)

        ctx.clearScheduledEventOptions()

        return this.success(!!edit)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`, `description`, `type`, `start`, `end`, `cover`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. URL arguments must start with `https://` — plain `http://` fails the built-in URL check.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createScheduledEvent`]($createScheduledEvent.md)
- [`$deleteScheduledEvent`]($deleteScheduledEvent.md)
- [`$getScheduledEvent`]($getScheduledEvent.md)
- [`$setScheduledEventChannel`]($setScheduledEventChannel.md)
- [`$setScheduledEventLocation`]($setScheduledEventLocation.md)

**Source:** [`src/native/event/editScheduledEvent.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/event/editScheduledEvent.ts)
