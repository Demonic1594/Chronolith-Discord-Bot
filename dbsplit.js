/*
 *  * Chronolith — per-concern DB router.
 *  *
 *  * ForgeDB is a first-registered-wins singleton: one sqlite source per
 *  * process, every variable in database/forge.db. This module wraps the
 *  * static DataBase methods (set/get/find/delete/getAll + cooldowns) and
 *  * routes each variable to a per-concern sqlite file by name prefix.
 *  * Unknown names fall back to the original forge.db (misc bucket), so
 *  * nothing is ever lost or unreadable. On first boot the legacy rows are
 *  * migrated into their buckets (upsert by identifier, then removed from
 *  * the legacy file only after a successful save).
 *  *
 *  * Buckets (DB_FOLDER/moderation.sqlite, security.sqlite, config.sqlite,
 *  * ephemeral.sqlite, cooldowns.sqlite):
 *  *   moderation  case_*, caseCount, ulist_*, note_*, noteCount, nlist_*,
 *  *               report_*, reportCount, rall
 *  *   security    tb_*, tb_all, timedouts, lkd_*, lkd_all, anc_*, rl_*,
 *  *               joins_*, allb, alll
 *  *   config      cfg
 *  *   ephemeral   snipe_*, esnipe_*, ms_*
 *  *
 *  * init() resolves once the ForgeDB extension is connected and the
 *  * migration has run — await it before client.login().
 *  */
const path = require("path");
const fs = require("fs");
require("reflect-metadata");
const { DataSource } = require("typeorm");
const { SQLiteRecord, Cooldown } = require("@tryforge/forge.db/dist/util/types");
const DataBase = require("@tryforge/forge.db/dist/util/database").DataBase;

const FOLDER = process.env.DB_FOLDER || "database";
const ROUTES = [
    ["moderation", "^(case_|caseCount$|ulist_|note_|noteCount$|nlist_|report_|reportCount$|rall$)"],
    ["security", "^(tb_|tb_all$|timedouts$|lkd_|lkd_all$|anc_|rl_|joins_|allb$|alll$)"],
    ["config", "^cfg$"],
    ["ephemeral", "^(snipe_|esnipe_|ms_)"],
];

const buckets = {};
let initialized = null;

function routeFor(name) {
    for (const [bucket, pat] of ROUTES) {
        if (new RegExp(pat).test(name)) return bucket;
    }
    return "misc";
}

function routeIdentifier(identifier) {
    for (const [bucket, pat] of ROUTES) {
        if (new RegExp("_" + pat).test(identifier)) return bucket;
    }
    return "misc";
}

async function bucket(bucketName) {
    if (buckets[bucketName]) return buckets[bucketName];
    if (bucketName === "misc") {
        buckets.misc = DataBase.db;
        return buckets.misc;
    }
    if (bucketName === "cooldowns") {
        buckets.cooldowns = new DataSource({
            type: "better-sqlite3",
            database: path.join(FOLDER, "cooldowns.sqlite"),
            entities: [SQLiteRecord, Cooldown],
            synchronize: true,
        });
        await buckets.cooldowns.initialize();
        return buckets.cooldowns;
    }
    fs.mkdirSync(path.resolve(FOLDER), { recursive: true });
    buckets[bucketName] = new DataSource({
        type: "better-sqlite3",
        database: path.join(FOLDER, bucketName + ".sqlite"),
        entities: [SQLiteRecord, Cooldown],
        synchronize: true,
    });
    await buckets[bucketName].initialize();
    return buckets[bucketName];
}

async function repoFor(data) {
    const name = data.name ?? "";
    const ds = await bucket(name ? routeFor(name) : routeIdentifier(data.identifier ?? ""));
    return ds.getRepository(SQLiteRecord);
}

async function cdRepo() {
    const ds = await bucket("cooldowns");
    return ds.getRepository(Cooldown);
}

async function migrate() {
    const misc = await bucket("misc");
    const recRepo = misc.getRepository(SQLiteRecord);
    const rows = await recRepo.find();
    let moved = 0, kept = 0;
    for (const row of rows) {
        const target = routeFor(row.name ?? "");
        if (target === "misc") { kept++; continue; }
        const ds = await bucket(target);
        const tRepo = ds.getRepository(SQLiteRecord);
        const exists = await tRepo.findOneBy({ identifier: row.identifier });
        if (!exists) await tRepo.save({ ...row });
        await recRepo.delete({ identifier: row.identifier });
        moved++;
    }
    const cdRepoOld = misc.getRepository(Cooldown);
    const cds = await cdRepoOld.find();
    const cdNew = await cdRepo();
    for (const cd of cds) {
        if (!await cdNew.findOneBy({ identifier: cd.identifier })) await cdNew.save({ ...cd });
        await cdRepoOld.delete({ identifier: cd.identifier });
    }
    console.log(`[dbsplit] migrated ${moved} row(s) into buckets, ${kept} stay in misc, ${cds.length} cooldown(s) moved`);
}

function patch() {
    const orig = {
        set: DataBase.set.bind(DataBase), get: DataBase.get.bind(DataBase),
        find: DataBase.find.bind(DataBase), delete: DataBase.delete.bind(DataBase),
        getAll: DataBase.getAll.bind(DataBase), wipe: DataBase.wipe.bind(DataBase),
        cdAdd: DataBase.cdAdd.bind(DataBase), cdDelete: DataBase.cdDelete.bind(DataBase),
        cdTimeLeft: DataBase.cdTimeLeft.bind(DataBase), cdWipe: DataBase.cdWipe.bind(DataBase),
    };
    DataBase.set = async (data) => {
        const repo = await repoFor(data);
        const oldData = await repo.findOneBy({ identifier: DataBase.make_intetifier(data) });
        if (oldData) DataBase.emitter.emit("variableUpdate", { newData: data, oldData });
        else DataBase.emitter.emit("variableCreate", { data });
        const rec = new SQLiteRecord();
        rec.identifier = DataBase.make_intetifier(data);
        rec.name = data.name; rec.id = data.id; rec.type = data.type; rec.value = data.value;
        if (["member", "channel", "role"].includes(data.type)) rec.guildId = data.guildId;
        await repo.save(rec);
    };
    DataBase.get = async (data) => {
        const repo = await repoFor(data);
        return repo.findOneBy({ identifier: data.identifier ?? DataBase.make_intetifier(data) });
    };
    DataBase.find = async (data) => (await repoFor({ name: Object.values(data)[0] ?? "", ...data })).find({ where: { ...data } });
    DataBase.delete = async (data) => {
        const repo = await repoFor(data);
        return repo.delete({ identifier: data.identifier ?? DataBase.make_intetifier(data) });
    };
    DataBase.getAll = async () => {
        const out = [];
        for (const b of [...new Set(["misc", "moderation", "security", "config", "ephemeral"])]) {
            const ds = await bucket(b).catch(() => null);
            if (ds) out.push(...ds.getRepository(SQLiteRecord).find());
        }
        return out;
    };
    DataBase.wipe = async () => {
        for (const b of ["misc", "moderation", "security", "config", "ephemeral"]) {
            const ds = await bucket(b).catch(() => null);
            if (ds) await ds.getRepository(SQLiteRecord).clear();
        }
    };
    DataBase.cdAdd = async (data) => {
        const repo = await cdRepo();
        const cd = new Cooldown();
        cd.identifier = DataBase.make_cdIdentifier(data);
        cd.name = data.name; cd.id = data.id; cd.startedAt = Date.now(); cd.duration = data.duration;
        await repo.save(cd);
    };
    DataBase.cdDelete = async (identifier) => (await cdRepo()).delete({ identifier });
    DataBase.cdTimeLeft = async (identifier) => {
        const data = await (await cdRepo()).findOneBy({ identifier });
        return data ? { ...data, left: Math.max(data.duration - (Date.now() - data.startedAt), 0) } : { left: 0 };
    };
    DataBase.cdWipe = async () => (await cdRepo()).clear();
    return orig;
}

function init() {
    if (initialized) return initialized;
    initialized = (async () => {
        const deadline = Date.now() + 15000;
        while (!(DataBase.db && typeof DataBase.db.query === "function")) {
            if (Date.now() > deadline) throw new Error("[dbsplit] ForgeDB never connected");
            await new Promise((r) => setTimeout(r, 50));
        }
        patch();
        if (process.env.DB_SPLIT !== "off") await migrate();
        console.log("[dbsplit] routing active:",
            ROUTES.map(([b]) => b).join(", "), "+ misc/cooldowns");
    })();
    return initialized;
}

module.exports = { init, routeFor, ROUTES };
