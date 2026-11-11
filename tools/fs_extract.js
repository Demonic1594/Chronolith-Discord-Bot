// fs_extract: collect ForgeScript source strings, exactly as ForgeScript receives them.
//
//   node tools/fs_extract.js js <dir>...   require every .js file and collect `code`/`name`
//                                          strings from the exported command/function objects
//   node tools/fs_extract.js md <dir>...   pull code out of markdown: ```fs blocks as-is, and
//                                          `code: \`...\`` template literals in ```js blocks
//                                          (cooked by JavaScript, so escapes behave as in a bot)
// Output: one JSON object per line: {"id": "file#n", "code": "..."}
const fs = require("fs")
const path = require("path")

const [mode, ...dirs] = process.argv.slice(2)
const SKIP = new Set(["node_modules", ".git", "tests", "probe"])
let n = 0
const emit = (id, code) => {
    if (typeof code === "string" && code.length) process.stdout.write(JSON.stringify({ id: `${id}#${n++}`, code }) + "\n")
}

function* walk(dir, ext) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP.has(e.name)) continue
        const p = path.join(dir, e.name)
        if (e.isDirectory()) yield* walk(p, ext)
        else if (p.endsWith(ext)) yield p
    }
}

function collect(obj, file, seen = new Set()) {
    if (!obj || typeof obj !== "object" || seen.has(obj)) return
    seen.add(obj)
    if (Array.isArray(obj)) return obj.forEach((x) => collect(x, file, seen))
    for (const key of ["code", "name"]) if (typeof obj[key] === "string") emit(`${file}:${key}`, obj[key])
    for (const v of Object.values(obj)) if (v && typeof v === "object") collect(v, file, seen)
}

function cook(raw) {
    try {
        return new Function("return `" + raw + "`")()
    } catch {
        return null // contains ${...} referring to outer JS, or is not a complete literal
    }
}

for (const dir of dirs) {
    if (mode === "js") {
        const root = path.resolve(dir)
        for (const file of walk(root, ".js")) {
            if (file.includes(`${path.sep}tools${path.sep}`)) continue
            // never require top-level entry points (index.js would start the bot and log in)
            if (path.dirname(file) === root) continue
            try {
                collect(require(file), path.relative(process.cwd(), file))
            } catch (e) {
                process.stderr.write(`skip ${file}: ${e.message.split("\n")[0]}\n`)
            }
        }
    } else if (mode === "fns") {
        // custom function definitions (functions/ folder): what ForgeFunction receives
        for (const file of walk(path.resolve(dir), ".js")) {
            let mod
            try { mod = require(file) } catch (e) { process.stderr.write(`skip ${file}: ${e.message.split("\n")[0]}\n`); continue }
            const list = (Array.isArray(mod) ? mod : [mod]).flat(Infinity).map((x) => (x && x.data && x.data.name ? x.data : x))
            for (const f of list) {
                if (!f || typeof f.name !== "string") continue
                process.stdout.write(JSON.stringify({
                    file: path.relative(process.cwd(), file), name: f.name, params: f.params ?? [],
                    brackets: f.brackets ?? null, firstParamCondition: !!f.firstParamCondition, code: f.code,
                }) + "\n")
            }
        }
    } else if (mode === "md") {
        for (const file of walk(path.resolve(dir), ".md")) {
            const text = fs.readFileSync(file, "utf8")
            const rel = path.relative(process.cwd(), file)
            for (const m of text.matchAll(/```(\w*)\n([\s\S]*?)```/g)) {
                const lang = m[1].toLowerCase()
                if (["fs", "forgescript", "forge"].includes(lang)) emit(`${rel}:fs`, m[2].replace(/\n$/, ""))
                else if (["js", "javascript", "ts"].includes(lang)) {
                    for (const t of m[2].matchAll(/\bcode\s*:\s*`((?:\\[\s\S]|[^`\\])*)`/g)) {
                        const cooked = cook(t[1])
                        if (cooked !== null) emit(`${rel}:js`, cooked)
                    }
                }
            }
        }
    }
}
