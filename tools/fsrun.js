// fsrun: execute ForgeScript code on the REAL interpreter, offline (no Discord login).
// Only code that doesn't need the gateway or the REST API gives meaningful results.
//
//   echo '{"id":1,"code":"$sum[1;2]"}' | node tools/fsrun.js
//   -> {"id":1,"result":"3","error":null}
// result null = the run stopped (an error, $stop, a gate...). error = the ForgeScript
// error text the bot would have reported, if any.
//   FS_MODULE=<path to @tryforge/forgescript>   default: resolve from the current folder
const readline = require("readline")
const modPath = process.env.FS_MODULE || require.resolve("@tryforge/forgescript", { paths: [process.cwd()] })
const { ForgeClient, Compiler, Interpreter } = require(modPath)

// The client registers every native function; it never logs in.
const write = process.stdout.write.bind(process.stdout)
process.stdout.write = () => true
const client = new ForgeClient({ intents: ["Guilds"] })
process.stdout.write = write

async function run(code) {
    const captured = []
    const origOut = process.stdout.write, origErr = process.stderr.write
    const grab = (chunk) => (captured.push(String(chunk)), true)
    process.stdout.write = grab
    process.stderr.write = grab
    let result = null, compileError = null
    try {
        const data = Compiler.compile(code)
        result = await Interpreter.run({
            client, data, obj: { channel: { id: "1" } }, command: null,
            doNotSend: true, disableConsoleErrors: false, allowTopLevelReturn: true,
            redirectErrorsToConsole: true, // ctx.alert() logs the error instead of posting it
        })
    } catch (e) {
        compileError = String(e?.message ?? e)
    } finally {
        process.stdout.write = origOut
        process.stderr.write = origErr
    }
    const log = captured.join("").replace(/\x1b\[[0-9;]*m/g, "")
    const m = log.match(/\[ERROR\]\s*([\s\S]*?)(?:\n\s+at |\n\[|$)/)
    const clean = (s) => s && s.replace(/[*`]/g, "").replace(/^>\s*/, "").trim()
    return { result, error: clean(compileError) || clean(m && m[1]) || null }
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity })
const queue = []
rl.on("line", (line) => line.trim() && queue.push(JSON.parse(line)))
rl.on("close", async () => {
    for (const { id, code } of queue) process.stdout.write(JSON.stringify({ id, ...(await run(code)) }) + "\n")
    process.exit(0)
})
