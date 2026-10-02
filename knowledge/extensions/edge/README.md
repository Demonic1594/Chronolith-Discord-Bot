# Edge

> Additional ForgeScript functions: named cache tables, JSON math, extended math utilities (off-registry; npm @quoriel/edge, github nationdex/edge).

| | |
|---|---|
| Type | Community extension |
| GitHub | https://github.com/nationdex/edge |
| npm | `edge` (`npm i edge`) |
| Lead dev | Mlad |
| Main branch | `main` |
| Docs page | https://docs.botforge.org/?p=Edge |

## Contents

- [`functions/`](functions/_INDEX.md) — 28 functions
- [`enums/`](enums/_INDEX.md) — 1 enums

---

## Package README (verbatim from GitHub)

# QuorielEdge
An extended set of functions for **ForgeScript**, designed to optimize workflows, simplify the execution of various tasks, and support script integration and processing.

## Installation
```
npm i github:quoriel/edge
```

## Connection
```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielEdge } = require("@quoriel/edge");

const edge = new QuorielEdge({
    events: [
        "interactionCreate"
    ]
});

const client = new ForgeClient({
    extensions: [
        edge
    ]
});

// Loading interactions.
edge.commands.load("interactions");

client.login("...");
```

The same works from TypeScript, with full type information out of the box:
```ts
import { ForgeClient } from "@tryforge/forgescript";
import { QuorielEdge } from "@quoriel/edge";

const edge = new QuorielEdge({
    events: ["interactionCreate"]
});

const client = new ForgeClient({ extensions: [edge] });

edge.commands.load("interactions");

client.login("...");
```

## TypeScript
QuorielEdge is written in TypeScript and ships its own declaration files - no
`@types` package is needed. `require()` from JavaScript and `import` from
TypeScript both resolve to the same compiled `dist/` output, so both are
fully supported.

## Useful
- Configure the class to use cache functions [View documentation](docs/CACHE.md)
- Events and commands with advanced routing and filtering [View documentation](docs/EVENTS.md)
- Optional features that extend ForgeScript behavior [View documentation](docs/PATCHES.md)
- Define JSON schemas to auto-fill missing environment data [View documentation](docs/DEFAULTS.md)
