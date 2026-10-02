# $getScheduledEvent

> Returns a scheduled event of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `event` | v2.6.0 | optional | yes | `Json`, `Unknown` |

## Signature

```fs
$getScheduledEvent[guild ID;event ID;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get scheduled event from |
| 2 | `event ID` | `ScheduledEvent` | **yes** | no | The scheduled event to get |
| 3 | `property` | `Enum` | no | no | The property of the scheduled event to return |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get scheduled event from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`event ID`** (`ScheduledEvent`, required): The scheduled event to get. Expects a scheduled event ID. Fetched from the pointer guild's scheduledEvents manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`property`** (`Enum`, optional): The property of the scheduled event to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Event functions (re)schedule guild scheduled events and set their channel/location metadata.

`$getScheduledEvent` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getScheduledEvent[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$getScheduledEvent[123456789012345678;123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/event/getScheduledEvent.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (prop) return this.success(ScheduledEventProperties[prop](event))
        return this.successJSON(event)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createScheduledEvent`]($createScheduledEvent.md)
- [`$deleteScheduledEvent`]($deleteScheduledEvent.md)
- [`$editScheduledEvent`]($editScheduledEvent.md)
- [`$setScheduledEventChannel`]($setScheduledEventChannel.md)
- [`$setScheduledEventLocation`]($setScheduledEventLocation.md)

**Source:** [`src/native/event/getScheduledEvent.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/event/getScheduledEvent.ts)
