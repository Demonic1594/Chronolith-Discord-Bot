# $editStageInstance

> Edits a stage instance, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.3.0 | required | yes | `Boolean` |

## Signature

```fs
$editStageInstance[stage ID;topic;privacy level]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `stage ID` | `StageInstance` | **yes** | no | The stage instance to edit |
| 2 | `topic` | `String` | no | no | The new topic of the stage instance |
| 3 | `privacy level` | `Enum` | no | no | The new privacy level of the stage instance |

### Per-parameter notes

- **`stage ID`** (`StageInstance`, required): The stage instance to edit. Expects a stage instance. Resolved from the stage channel ID or the pointer guild's stage instances.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`topic`** (`String`, optional): The new topic of the stage instance. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`privacy level`** (`Enum`, optional): The new privacy level of the stage instance. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$editStageInstance` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editStageInstance[123456789012345678]
```

**Full form (all arguments)**

```fs
$editStageInstance[123456789012345678;value;value]
```

## Reference implementation (source)

Taken from `src/native/channel/editStageInstance.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await instance.edit({ topic: topic || undefined, privacyLevel: level || undefined }).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`topic`, `privacy level`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/editStageInstance.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/editStageInstance.ts)
