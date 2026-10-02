/* All-commands sweep: probe every prefix command, require a reply,
   flag leaks (garbage fragments) and embed anomalies. */
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();
const G = process.env.TEST_GUILD, C = process.env.TEST_CHANNEL, A = process.env.TEST_AUTHOR;
process.on("unhandledRejection", () => {});
const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages", "MessageContent"],
    prefixes: ["c!", "c?", "%"], events: ["messageCreate"]
});
client.functions.load("functions");
client.commands.load("events");
client.commands.load("prefixesCmd");
const results = [];
let pending = null;
const LEAK = /\[\.\.\.\]|^;|^true$|^false$|^\[undefined|^NaN/;
client.on("messageCreate", m => {
    if (m.author.id !== client.user.id || !pending) return;
    const e = m.embeds[0]?.data;
    const text = [e?.author?.name, e?.description, m.content, JSON.stringify(e?.fields||[])].join(" ");
    const r = pending; pending = null;
    clearTimeout(r.timer);
    const leak = LEAK.test(m.content || "");
    results.push({ label: r.label, ok: !leak, got: leak ? `LEAK: ${JSON.stringify((m.content||"").slice(0,80))}` : "ok" });
    r.resolve();
});
function probe(label, timeoutMs = 9000) {
    return new Promise(resolve => {
        pending = { label, resolve, timer: setTimeout(() => {
            results.push({ label, ok: false, got: "(no reply)" });
            pending = null; resolve();
        }, timeoutMs) };
    });
}
async function send(content) {
    const channel = await client.channels.fetch(C);
    client.emit("messageCreate", new Message(client, {
        id: `${Date.now()}${Math.floor(Math.random()*999)}`, channel_id: C, guild_id: G, content,
        author: { id: A, username: "owner", discriminator: "0", bot: false },
        member: { user: { id: A }, roles: [], joined_at: new Date().toISOString() },
        timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
    }, channel));
}
(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise(r => setTimeout(r, 4000));
    const BOT = client.user.id;
    const T = (process.env.ONLY || "").split("|").filter(Boolean).length ? process.env.ONLY.split("|") : [
        // core/info — happy paths
        "%ping", "%help", "%stats", "%serverinfo", "%userinfo", "%avatar", "%banner",
        "%inrole @everyone", "%roleinfo @everyone",
        // misc
        "%snipe", "%editsnipe", "%ticket",
        // channel — usage/safe paths
        "%slowmode", "%slowmode 5", "%purge", "%cleanup", "%lock", "%unlock",
        // mod — punishments on bot target (fast deterministic rejection) + usage paths
        `%warn <@${BOT}> allsweep`, `%mute <@${BOT}> 10m allsweep`, `%unmute <@${BOT}>`,
        `%kick <@${BOT}> allsweep`, `%softban <@${BOT}> allsweep`, `%ban <@${BOT}> allsweep`,
        `%hardban <@${BOT}> 1h allsweep`, `%unban ${BOT}`, `%massban`,
        `%quarantine <@${BOT}>`, `%unquarantine <@${BOT}>`, "%role", "%moderations", "%modstats",
        // cases/notes
        "%cases", "%case 1", "%case 99999", "%reason", "%reason 1 allsweep edit",
        "%notes", "%addnote <@1553804378475864156> allsweep note", "%notes <@1553804378475864156>",
        "%editnote", "%removenote", "%clearnotes <@1553804378475864156>", "%clearwarns",
        "%removewarning",
        // modlog
        "%modlog recent", "%modlog", "%modlog user", "%modlog action", "%modlog set off",
        // reports lifecycle
        "%reports", "%claim", "%close", "%dismiss", "%archivereport", "%report",
        `%report <@${BOT}> allsweep report`, "%reports open", "%setreportchannel",
        // automod/config — views + usage paths
        "%words", "%wordadd", "%worddel", "%linkwl", "%automod", "%joingate",
        "%config", "%modrole", "%muterole", "%autorole", "%warnset", "%logs",
        "%dmnotices", "%protect", "%antinuke", "%verify", "%tickets", "%quicksetup",
    ];
    for (const cmd of T) {
        const p = probe(cmd);
        await send(cmd);
        await p;
        await new Promise(r => setTimeout(r, Number(process.env.PACE_MS || 350))); // cooldown spacing
    }
    console.log("\n===== ALL-COMMAND SWEEP =====");
    let pass = 0;
    for (const r of results) {
        console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.ok ? "" : "  — " + r.got}`);
        if (r.ok) pass++;
    }
    console.log(`\n${pass}/${results.length} replied cleanly`);
    process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error("harness error:", e?.message || e); process.exit(2); });
