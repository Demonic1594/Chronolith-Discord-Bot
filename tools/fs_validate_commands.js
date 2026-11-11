// fs_validate_commands: load every command file the way ForgeScript does and run the
// real validation (ForgeScript 2.8.0+: BaseCommand constructor + validate(), and
// ApplicationCommand for slash files). A file that fails here stops the bot at startup.
//
//   FS_MODULE=<path to @tryforge/forgescript> node tools/fs_validate_commands.js [dir...]
// Default dirs: prefixesCmd events (message/event commands), slashesCmd (application commands).
const fs = require("fs")
const path = require("path")
const modPath = process.env.FS_MODULE || require.resolve("@tryforge/forgescript", { paths: [process.cwd()] })
const { ForgeClient, BaseCommand, ApplicationCommand } = require(modPath)
const version = require(path.join(path.dirname(require.resolve(modPath)), "..", "package.json")).version

// Build the client like index.js: the bot's extensions, then its custom functions, so the
// compiler knows every name the bot uses (a missing one would change how names match).
const nearFs = path.resolve(path.dirname(require.resolve(modPath)), "..", "..", "..")
const extensions = []
try {
    const { ForgeDB } = require(require.resolve("@tryforge/forge.db", { paths: [nearFs, process.cwd()] }))
    extensions.push(new ForgeDB({ type: "better-sqlite3" }))
} catch (e) {
    console.log(`note: ForgeDB not installed next to ForgeScript (${e.message.split("\n")[0]}); ForgeDB names will not resolve`)
}
const w = process.stdout.write.bind(process.stdout)
process.stdout.write = () => true
const client = new ForgeClient({ intents: ["Guilds"], extensions })
if (fs.existsSync("functions")) client.functions.load("functions")
process.stdout.write = w

function* walk(dir) {
    if (!fs.existsSync(dir)) return
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) yield* walk(p)
        else if (p.endsWith(".js")) yield p
    }
}

const groups = { base: ["prefixesCmd", "events"], app: ["slashesCmd"] }
let files = 0, problems = 0
for (const [kind, dirs] of Object.entries(groups)) {
    for (const dir of dirs) {
        for (const file of walk(path.resolve(dir))) {
            files++
            const rel = path.relative(process.cwd(), file)
            let mod
            try { mod = require(file) } catch (e) { problems++; console.log(`FAIL ${rel}: cannot load: ${e.message}`); continue }
            for (const data of [mod].flat()) {
                try {
                    if (kind === "app" && data && data.data) new ApplicationCommand({ ...data, path: rel })
                    else { const c = new BaseCommand({ ...data, path: rel }); c.validate() }
                } catch (e) {
                    problems++
                    console.log(`FAIL ${rel}: ${String(e.message).replace(/[*`>]/g, "").trim()}`)
                }
            }
        }
    }
}
console.log(`${files - problems}/${files} command files pass ForgeScript ${version} load validation`)
process.exit(problems ? 1 : 0)
