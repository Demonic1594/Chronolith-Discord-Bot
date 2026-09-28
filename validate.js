/*
 * Chronolith compile validation — loads every command/event/function file
 * through the REAL ForgeScript compiler (no login, no Discord connection).
 *
 *   node validate.js
 *
 * Exits non-zero if any file fails to compile. Add-ons are loaded so
 * ForgeDB function names register before command code compiles.
 */
const path = require("path");
const fs = require("fs");

const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");

const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages",
              "MessageContent", "GuildInvites", "GuildWebhooks",
              "AutoModerationConfiguration", "AutoModerationExecution"],
    prefixes: ["c!"],
    events: ["clientReady", "messageCreate", "messageDelete", "messageUpdate",
             "interactionCreate", "guildMemberAdd", "guildMemberRemove",
             "guildBanAdd", "guildBanRemove", "channelCreate", "channelDelete",
             "roleCreate", "roleDelete"]
});

let fail = 0, ok = 0;
const failures = [];

function tryAdd(kind, file, fn, load) {
    load = load || require;
    try {
        fn(load(file));
        ok++;
    } catch (e) {
        fail++;
        failures.push(`${kind} ${path.relative(process.cwd(), file)}: ${e.message}`);
    }
}

// custom functions first (commands compile against the global FunctionManager)
const fnDir = path.join(__dirname, "functions");
const { Compiler } = require("@tryforge/forgescript");
const fnDefs = [];
for (const f of fs.readdirSync(fnDir).filter(x => x.endsWith(".js"))) {
    const defs = require(path.join(fnDir, f));
    for (const def of defs) {
        fnDefs.push([f, def]);
        tryAdd("function", path.join(fnDir, f), () => client.functions.add(def));
    }
}

// Custom-function bodies compile LAZILY (on first call at runtime), so
// loading them proves nothing — force-compile every body through the real
// compiler here. This is the gap that once let a broken $arrayMap body
// through offline validation and crashed at runtime instead.
for (const [file, def] of fnDefs) {
    try {
        Compiler.compile(def.code, "functions/" + file);
    } catch (e) {
        fail++;
        failures.push(`function-body functions/${file} → $${def.name}: ${e.message}`);
    }
}


// event handlers + prefix commands via the commands manager
for (const dir of ["events", "prefixesCmd"]) {
    const root = path.join(__dirname, dir);
    const walk = d => {
        for (const f of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, f.name);
            if (f.isDirectory()) walk(p);
            else if (f.name.endsWith(".js")) {
                tryAdd(dir, p, m => { for (const x of [].concat(m)) client.commands.add(x); }, () => require(p));
            }
        }
    };
    walk(root);
}

// slash commands
const scDir = path.join(__dirname, "slashesCmd");
const walkSc = d => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, f.name);
        if (f.isDirectory()) walkSc(p);
        else if (f.name.endsWith(".js")) {
            tryAdd("slash", p, m => client.applicationCommands.add(m), () => require(p));
        }
    }
};
walkSc(scDir);

console.log(`\nCompiled ${ok} definitions — ${fail} failure(s).`);
for (const f of failures) console.log("  FAIL " + f);
process.exit(fail ? 1 : 0);
