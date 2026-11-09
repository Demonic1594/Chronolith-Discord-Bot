// fsref: run the REAL ForgeScript compiler and print its output as JSON.
// Used by tools/test_fsparse.py to prove fsparse.py produces the same result.
//
// Input (stdin): one JSON object per line: {"id": ..., "code": "..."}
// Output (stdout): one JSON object per line with the compiled tree, or the error.
//
// The function table comes from tools/fs_metadata.json (same as fsparse.py), so
// both sides see identical names, aliases, brackets and field flags.
//   FS_MODULE=/path/to/node_modules/@tryforge/forgescript  (default: resolve from cwd)
//   FS_PACKAGES=ForgeScript,ForgeDB                      (default: all packages)
const fs = require("fs")
const path = require("path")
const readline = require("readline")

const modPath = process.env.FS_MODULE || require.resolve("@tryforge/forgescript", { paths: [process.cwd()] })
const { Compiler, FunctionManager } = require(modPath)

// --native-raw: print what ForgeScript itself registers (to check fs_metadata.json against it)
if (process.argv.includes("--native-raw")) {
    FunctionManager.loadNative()
    process.stdout.write(JSON.stringify(FunctionManager.raw) + "\n")
    process.exit(0)
}
const meta = JSON.parse(fs.readFileSync(path.join(__dirname, "fs_metadata.json"), "utf8"))
const wanted = process.env.FS_PACKAGES ? new Set(process.env.FS_PACKAGES.split(",")) : null

// Same registration rules as ForgeScript's FunctionManager: across packages the first
// name wins (core loads first); the compiler then maps every name and alias.
const seen = new Set()
const raw = []
for (const f of meta.functions) {
    if (wanted && !wanted.has(f.package)) continue
    if (seen.has(f.name)) continue
    seen.add(f.name)
    raw.push({
        name: f.name,
        aliases: f.aliases.length ? f.aliases : null,
        args: f.brackets === undefined || f.brackets === null
            ? null
            : { required: f.brackets, fields: f.args.map((a) => ({ condition: a.condition, rest: a.rest })) },
    })
}
Compiler["setFunctions"](raw)

function field(f) {
    if ("op" in f) {
        return { op: f.op, lhs: field(f.lhs), rhs: f.rhs ? field(f.rhs) : null }
    }
    return {
        value: f.value,
        rawValue: f.rawValue,
        functions: f.functions.map(fn),
        rendered: f.resolve(f.functions.map((x) => `<${x.index}>`)),
    }
}

function fn(f) {
    return {
        name: f.name,
        id: f.id,
        index: f.index,
        negated: f.negated,
        silent: f.silent,
        count: f.count,
        fields: f.fields ? f.fields.map(field) : null,
    }
}

function compile(code) {
    try {
        const r = new Compiler(null, code).compile()
        return { code: r.code, functions: r.functions.map(fn), rendered: r.resolve(r.functions.map((x) => `<${x.index}>`)) }
    } catch (e) {
        const msg = String(e.message).replace(/[*`]/g, "").replace(/^>\s*/, "")
        const m = msg.match(/^(.*) at (\d+):(\d+) \((.*)\)$/s)
        return m ? { error: m[1], line: +m[2], column: +m[3] } : { error: msg, crash: true }
    }
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity })
rl.on("line", (line) => {
    if (!line.trim()) return
    const { id, code } = JSON.parse(line)
    process.stdout.write(JSON.stringify({ id, ...compile(code) }) + "\n")
})
