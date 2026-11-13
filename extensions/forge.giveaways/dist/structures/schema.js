"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGiveawaySchema = createGiveawaySchema;
const typeorm_1 = require("typeorm");
const Giveaway_1 = require("./Giveaway");
/**
 * Stores numbers in BIGINT columns. Postgres and MySQL hand BIGINT back as
 * strings, so convert on read. The original mapped these to INTEGER (int4),
 * which overflows for millisecond timestamps and any duration over 24.8 days.
 */
const bigintNumber = {
    to: (v) => (v == null ? v : Math.trunc(v)),
    from: (v) => (v == null ? v : Number(v)),
};
/**
 * Comma separated list, byte-compatible with TypeORM's `simple-array` that the
 * original schema used, so existing rows keep loading.
 */
const stringArray = {
    to: (v) => (v == null ? v : v.join(",")),
    from: (v) => (typeof v === "string" ? (v.length ? v.split(",") : []) : v ?? []),
};
/** JSON text, compatible with TypeORM's `simple-json`. */
const json = {
    to: (v) => (v == null ? null : JSON.stringify(v)),
    from: (v) => {
        if (typeof v !== "string" || !v.length)
            return v ?? null;
        try {
            return JSON.parse(v);
        }
        catch {
            return null;
        }
    },
};
function columns(driver) {
    const mongo = driver === "mongodb";
    // MySQL TEXT caps out at 64 KB (about 3,400 entries); LONGTEXT does not.
    const text = driver === "mysql" ? "longtext" : "text";
    const big = (extra = {}) => mongo ? { type: Number, ...extra } : { type: "bigint", transformer: bigintNumber, ...extra };
    // MongoDB stores arrays and objects natively.
    const list = (nullable = false) => mongo ? { type: "array", nullable } : { type: text, transformer: stringArray, nullable };
    const obj = () => mongo ? { type: "json", nullable: true } : { type: text, transformer: json, nullable: true };
    const snowflake = (nullable = false) => mongo ? { type: String, nullable } : { type: "varchar", length: 32, nullable };
    const cols = {
        id: { ...snowflake(), primary: !mongo },
        prize: { type: text },
        duration: big(),
        timestamp: big(),
        winnersCount: { type: "int" },
        hasEnded: { type: Boolean },
        cancelled: { type: Boolean, default: false },
        endedAt: big({ nullable: true }),
        pausedAt: big({ nullable: true }),
        hostID: snowflake(),
        guildID: snowflake(),
        channelID: snowflake(),
        messageID: snowflake(true),
        entries: list(),
        entryWeights: obj(),
        winners: list(),
        previousWinners: list(true),
        requirements: obj(),
        bonusEntries: obj(),
        maxEntries: { type: "int", nullable: true },
        display: obj(),
    };
    if (mongo)
        cols.mongoId = { type: "objectId", objectId: true, primary: true };
    if (mongo)
        cols.winnersCount = { type: Number };
    if (mongo)
        cols.maxEntries = { type: Number, nullable: true };
    return cols;
}
/**
 * Builds the TypeORM schema for a driver. Table names match the decorator
 * based entities of the original extension ("giveaway" and "mongo_giveaway"),
 * so existing databases are upgraded in place by TypeORM's synchronize.
 */
function createGiveawaySchema(driver) {
    const mongo = driver === "mongodb";
    return new typeorm_1.EntitySchema({
        name: mongo ? "MongoGiveaway" : "Giveaway",
        tableName: mongo ? "mongo_giveaway" : "giveaway",
        target: mongo ? Giveaway_1.MongoGiveaway : Giveaway_1.Giveaway,
        columns: columns(driver),
        indices: [
            { name: "IDX_giveaway_message", columns: ["messageID"] },
            { name: "IDX_giveaway_guild_ended", columns: ["guildID", "hasEnded"] },
            ...(mongo ? [{ name: "IDX_giveaway_id", columns: ["id"], unique: true }] : []),
        ],
    });
}
//# sourceMappingURL=schema.js.map