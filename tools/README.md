# tools/

Development tooling for Chronolith. Nothing here runs in the bot.

## Everyday use

```bash
python3 tools/fslint.py                  # lint every command, event and function file
python3 tools/fslint.py prefixesCmd/mod  # lint one folder or file
python3 tools/fslint.py --snippet '$if[$get[a]==1;yes;no]'   # ForgeScript text, as ForgeScript receives it
python3 tools/fslint.py --parse 'Pong! $pingms'              # the exact compiler tree and output text
python3 tools/fslint.py --run '$sum[1;2]'                    # run it on the real interpreter (offline)
python3 tools/fslint.py --escape body.js                     # escape JS for $djsEval inside a template literal
python3 tools/gen_commands.py            # regenerate prefixesCmd/ and slashesCmd/ from the spec
node validate.js                         # compile every definition with the real compiler
node tools/fs_validate_commands.js       # ForgeScript's own load-time validation of every command file
```

`--run`, the validators and the tests need Node 22+ and `npm ci` (or `FS_MODULE` pointing at an
installed `@tryforge/forgescript`).

## How the linter works

| File | Role |
|---|---|
| `fsparse.py` | The ForgeScript compiler reimplemented in Python (LGPL-3.0-or-later, from `src/core/Compiler.ts`). Same tree, fields, condition operators, output text and compile errors (message, line, column) as the real one. |
| `fs_metadata.json` | Every function, alias, argument and enum of ForgeScript and its extensions, from the official metadata. Rebuild with `build_fs_metadata.py`. |
| `fsextract.py` | Finds `code:`/`name:` strings in JS files and cooks them exactly like JavaScript, keeping a map back to file positions. Also the escape helpers behind `--escape`. |
| `fslint_engine.py` | The rules. Each states the behaviour it relies on and how that was checked: `[compiler]`, `[runtime]`, `[source]` or `[heuristic]`. |
| `fslint.py` | The CLI: lint, parse, simulate, run, explain, complete, signature help, outline, deps, diff, fix, comment toggling. |

Function precedence follows `ForgeClient`: extensions register first (ForgeDB's cooldown functions
replace core's), then core, then this bot's custom functions, which overwrite. Only the packages in
`package.json` are known, so a name from an extension the bot doesn't load is reported correctly.

## How it is tested

| Script | What it proves |
|---|---|
| `test_fsparse.py` + `fsref.js` | fsparse and the real compiler give identical JSON for bot code, KB snippets and fuzzed input; the function table equals a real `ForgeClient` with the bot's extensions. |
| `test_fslint.py` + `fsrun.js` | Each rule fires on its example, and the real interpreter does what the rule's message says. |
| `fslint.py --self-test` | All of the above, plus JS string extraction and custom-function loading compared with Node (`fs_extract.js`). |

CI (`.github/workflows/fslint.yml`) runs the validators, the lint and the self-test on every push.

## Writing ForgeScript in this repo: the rules that bite

- In a `.js` template literal every ForgeScript escape needs two backslashes: `\\;` `\\[` `\\]` `\\$`.
  A single backslash is removed by JavaScript and silently does nothing.
- Brackets inside an argument are not counted: a literal `[x]` must be written `\\[x\\]`, or its `]`
  ends the function early.
- Colors always take a `#`: `$color[248046]` is the decimal number 248046 (`#03C8EE`).
- `$and`/`$or` take conditions separated by `;`. A comma is just text. (`gen_commands.py` converts
  commas for generated files; hand-written files must use `;`.)
- JavaScript for `$djsEval`: write plain JS, then `python3 tools/fslint.py --escape file.js`.
