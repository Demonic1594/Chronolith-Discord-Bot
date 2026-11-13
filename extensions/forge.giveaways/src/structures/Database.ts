import { GiveawaysDatabaseManager } from "../managers/GiveawaysDatabaseManager"
import type { IGiveawayEvents } from "../handlers/GiveawaysEventHandler"
import { TypedEmitter } from "tiny-typed-emitter"
import { TransformEvents } from "@tryforge/forge.db"
import { Snowflake } from "discord.js"
import { DataSource, EntitySchema, Repository } from "typeorm"
import { Giveaway, IGiveaway, MongoGiveaway } from "./Giveaway"
import { createGiveawaySchema, DriverKind } from "./schema"

export type AnyGiveaway = typeof Giveaway | typeof MongoGiveaway
export type IGiveawayFindOptions = Partial<Omit<IGiveaway, "entries" | "winners" | "previousWinners" | "requirements" | "bonusEntries" | "display">>

function driverOf(type: string | undefined): DriverKind {
    switch (type) {
        case "mysql":
        case "mariadb":
            return "mysql"
        case "postgres":
            return "postgres"
        case "mongodb":
            return "mongodb"
        default:
            return "sqlite"
    }
}

const schemas = {
    sqlite: createGiveawaySchema("sqlite"),
    mysql: createGiveawaySchema("mysql"),
    postgres: createGiveawaySchema("postgres"),
    mongodb: createGiveawaySchema("mongodb"),
}

/**
 * Giveaway storage.
 *
 * Active (not yet ended) giveaways are kept in memory after start-up, so
 * looking one up when somebody clicks "Join" costs no database query. Every
 * write still goes to the database. This assumes one bot process owns the
 * giveaway table, which is how ForgeScript bots normally run.
 */
export class Database extends GiveawaysDatabaseManager {
    public database = "giveaways.db"

    public entityManager = {
        sqlite: [schemas.sqlite],
        mongodb: [schemas.mongodb],
        mysql: [schemas.mysql],
        postgres: [schemas.postgres],
    }

    public static entities: { Giveaway: AnyGiveaway } = { Giveaway }
    public static driver: DriverKind = "sqlite"

    private db: Promise<DataSource>
    private static db: DataSource | null = null
    private static schema: EntitySchema<Giveaway> = schemas.sqlite
    private static emitter: TypedEmitter<TransformEvents<IGiveawayEvents>>

    /** Active giveaways by id. */
    private static readonly active = new Map<Snowflake, Giveaway>()
    /** Message id to giveaway id, for active giveaways. */
    private static readonly byMessage = new Map<Snowflake, Snowflake>()

    constructor(private readonly emitter: TypedEmitter<TransformEvents<IGiveawayEvents>>) {
        super()
        this.db = this.getDB()
    }

    public async init() {
        Database.emitter = this.emitter
        Database.db = await this.db
        Database.driver = driverOf(Database.db.options.type)
        Database.schema = schemas[Database.driver]
        Database.entities = { Giveaway: Database.driver === "mongodb" ? MongoGiveaway : Giveaway }
        await Database.loadActive()
        Database.emitter.emit("databaseConnect")
    }

    /** Whether the database finished connecting. */
    public static get ready() {
        return !!this.db
    }

    private static repo(): Repository<Giveaway> {
        if (!this.db) throw new Error("[ForgeGiveaways] Database is not connected yet")
        return this.db.getRepository(this.schema)
    }

    /** Creates a new, unsaved giveaway instance of the right class for the driver. */
    public static create(options: ConstructorParameters<typeof Giveaway>[0]) {
        return new this.entities.Giveaway(options)
    }

    private static track(g: Giveaway) {
        for (const [msg, id] of this.byMessage) if (id === g.id && msg !== g.messageID) this.byMessage.delete(msg)
        if (g.hasEnded) {
            this.active.delete(g.id)
            if (g.messageID) this.byMessage.delete(g.messageID)
            return
        }
        this.active.set(g.id, g)
        if (g.messageID) this.byMessage.set(g.messageID, g.id)
    }

    private static untrack(id: Snowflake) {
        const g = this.active.get(id)
        if (g?.messageID) this.byMessage.delete(g.messageID)
        this.active.delete(id)
    }

    /** Loads every active giveaway into memory. */
    public static async loadActive() {
        this.active.clear()
        this.byMessage.clear()
        const rows = await this.repo().find({ where: { hasEnded: false } as any })
        for (const g of rows) this.track(g)
        return rows
    }

    /** Active giveaways currently held in memory. */
    public static activeGiveaways() {
        return [...this.active.values()]
    }

    /**
     * Gets an existing giveaway.
     * @param id The id of the giveaway to get.
     */
    public static async get(id: Snowflake) {
        if (!id) return null
        return this.active.get(id) ?? (await this.repo().findOneBy({ id } as any))
    }

    /**
     * Gets a giveaway by the message it is attached to.
     */
    public static async getByMessage(messageID: Snowflake, channelID?: Snowflake) {
        const id = this.byMessage.get(messageID)
        const cached = id ? this.active.get(id) : undefined
        if (cached) return cached
        const where: Record<string, string> = { messageID }
        if (channelID) where.channelID = channelID
        return (await this.repo().findOne({ where: where as any })) ?? null
    }

    /** Gets all existing giveaways. */
    public static async getAll() {
        return await this.repo().find()
    }

    /**
     * Finds existing giveaways matching the provided data.
     * @param data The data to use for searching.
     * @param amount The amount of results to return.
     */
    public static async find(data?: IGiveawayFindOptions, amount?: number) {
        return await this.repo().find({ where: data as any, take: amount })
    }

    /**
     * Saves a giveaway in the database.
     * @param data The giveaway data to save.
     */
    public static async set(data: Giveaway | MongoGiveaway) {
        const repo = this.repo()
        if (this.driver === "mongodb") {
            const existing = await repo.findOneBy({ id: data.id } as any) as MongoGiveaway | null
            if (existing) {
                const { mongoId: _ignored, ...rest } = data as MongoGiveaway
                await repo.update({ id: data.id } as any, rest as any)
            } else {
                await repo.save(data)
            }
        } else {
            await repo.save(data)
        }
        this.track(data)
    }

    /**
     * Deletes an existing giveaway from the database.
     * @param id The id of the giveaway to delete.
     */
    public static async delete(id: Snowflake) {
        this.untrack(id)
        return await this.repo().delete({ id } as any)
    }

    /** Deletes several giveaways by id. */
    public static async deleteMany(ids: Snowflake[]) {
        let affected = 0
        for (const id of ids) affected += (await this.delete(id)).affected ?? 0
        return affected
    }

    /**
     * Wipes the entire database.
     */
    public static async wipe() {
        this.active.clear()
        this.byMessage.clear()
        return await this.repo().clear()
    }
}
