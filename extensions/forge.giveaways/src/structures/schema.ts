import { EntitySchema, EntitySchemaColumnOptions, ValueTransformer } from "typeorm"
import { Giveaway, MongoGiveaway } from "./Giveaway"

export type DriverKind = "sqlite" | "mysql" | "postgres" | "mongodb"

/**
 * Stores numbers in BIGINT columns. Postgres and MySQL hand BIGINT back as
 * strings, so convert on read. The original mapped these to INTEGER (int4),
 * which overflows for millisecond timestamps and any duration over 24.8 days.
 */
const bigintNumber: ValueTransformer = {
    to: (v?: number | null) => (v == null ? v : Math.trunc(v)),
    from: (v?: string | number | null) => (v == null ? v : Number(v)),
}

/**
 * Comma separated list, byte-compatible with TypeORM's `simple-array` that the
 * original schema used, so existing rows keep loading.
 */
const stringArray: ValueTransformer = {
    to: (v?: string[] | null) => (v == null ? v : v.join(",")),
    from: (v?: string | null) => (typeof v === "string" ? (v.length ? v.split(",") : []) : v ?? []),
}

/** JSON text, compatible with TypeORM's `simple-json`. */
const json: ValueTransformer = {
    to: (v?: unknown) => (v == null ? null : JSON.stringify(v)),
    from: (v?: string | null) => {
        if (typeof v !== "string" || !v.length) return v ?? null
        try { return JSON.parse(v) } catch { return null }
    },
}

function columns(driver: DriverKind) {
    const mongo = driver === "mongodb"
    // MySQL TEXT caps out at 64 KB (about 3,400 entries); LONGTEXT does not.
    const text = driver === "mysql" ? "longtext" : "text"

    const big = (extra: Partial<EntitySchemaColumnOptions> = {}): EntitySchemaColumnOptions =>
        mongo ? { type: Number, ...extra } : { type: "bigint", transformer: bigintNumber, ...extra }

    // MongoDB stores arrays and objects natively.
    const list = (nullable = false): EntitySchemaColumnOptions =>
        mongo ? { type: "array", nullable } : { type: text, transformer: stringArray, nullable }

    const obj = (): EntitySchemaColumnOptions =>
        mongo ? { type: "json", nullable: true } : { type: text, transformer: json, nullable: true }

    const snowflake = (nullable = false): EntitySchemaColumnOptions =>
        mongo ? { type: String, nullable } : { type: "varchar", length: 32, nullable }

    const cols: Record<string, EntitySchemaColumnOptions> = {
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
    }

    if (mongo) cols.mongoId = { type: "objectId" as any, objectId: true, primary: true }
    if (mongo) cols.winnersCount = { type: Number }
    if (mongo) cols.maxEntries = { type: Number, nullable: true }

    return cols
}

/**
 * Builds the TypeORM schema for a driver. Table names match the decorator
 * based entities of the original extension ("giveaway" and "mongo_giveaway"),
 * so existing databases are upgraded in place by TypeORM's synchronize.
 */
export function createGiveawaySchema(driver: DriverKind) {
    const mongo = driver === "mongodb"
    return new EntitySchema<Giveaway>({
        name: mongo ? "MongoGiveaway" : "Giveaway",
        tableName: mongo ? "mongo_giveaway" : "giveaway",
        target: mongo ? MongoGiveaway : Giveaway,
        columns: columns(driver) as any,
        indices: [
            { name: "IDX_giveaway_message", columns: ["messageID"] },
            { name: "IDX_giveaway_guild_ended", columns: ["guildID", "hasEnded"] },
            ...(mongo ? [{ name: "IDX_giveaway_id", columns: ["id"], unique: true }] : []),
        ],
    })
}
