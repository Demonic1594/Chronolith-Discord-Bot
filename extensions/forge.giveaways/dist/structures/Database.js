"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const GiveawaysDatabaseManager_1 = require("../managers/GiveawaysDatabaseManager");
const Giveaway_1 = require("./Giveaway");
const schema_1 = require("./schema");
function driverOf(type) {
    switch (type) {
        case "mysql":
        case "mariadb":
            return "mysql";
        case "postgres":
            return "postgres";
        case "mongodb":
            return "mongodb";
        default:
            return "sqlite";
    }
}
const schemas = {
    sqlite: (0, schema_1.createGiveawaySchema)("sqlite"),
    mysql: (0, schema_1.createGiveawaySchema)("mysql"),
    postgres: (0, schema_1.createGiveawaySchema)("postgres"),
    mongodb: (0, schema_1.createGiveawaySchema)("mongodb"),
};
/**
 * Giveaway storage.
 *
 * Active (not yet ended) giveaways are kept in memory after start-up, so
 * looking one up when somebody clicks "Join" costs no database query. Every
 * write still goes to the database. This assumes one bot process owns the
 * giveaway table, which is how ForgeScript bots normally run.
 */
class Database extends GiveawaysDatabaseManager_1.GiveawaysDatabaseManager {
    emitter;
    database = "giveaways.db";
    entityManager = {
        sqlite: [schemas.sqlite],
        mongodb: [schemas.mongodb],
        mysql: [schemas.mysql],
        postgres: [schemas.postgres],
    };
    static entities = { Giveaway: Giveaway_1.Giveaway };
    static driver = "sqlite";
    db;
    static db = null;
    static schema = schemas.sqlite;
    static emitter;
    /** Active giveaways by id. */
    static active = new Map();
    /** Message id to giveaway id, for active giveaways. */
    static byMessage = new Map();
    constructor(emitter) {
        super();
        this.emitter = emitter;
        this.db = this.getDB();
    }
    async init() {
        Database.emitter = this.emitter;
        Database.db = await this.db;
        Database.driver = driverOf(Database.db.options.type);
        Database.schema = schemas[Database.driver];
        Database.entities = { Giveaway: Database.driver === "mongodb" ? Giveaway_1.MongoGiveaway : Giveaway_1.Giveaway };
        await Database.loadActive();
        Database.emitter.emit("databaseConnect");
    }
    /** Whether the database finished connecting. */
    static get ready() {
        return !!this.db;
    }
    static repo() {
        if (!this.db)
            throw new Error("[ForgeGiveaways] Database is not connected yet");
        return this.db.getRepository(this.schema);
    }
    /** Creates a new, unsaved giveaway instance of the right class for the driver. */
    static create(options) {
        return new this.entities.Giveaway(options);
    }
    static track(g) {
        for (const [msg, id] of this.byMessage)
            if (id === g.id && msg !== g.messageID)
                this.byMessage.delete(msg);
        if (g.hasEnded) {
            this.active.delete(g.id);
            if (g.messageID)
                this.byMessage.delete(g.messageID);
            return;
        }
        this.active.set(g.id, g);
        if (g.messageID)
            this.byMessage.set(g.messageID, g.id);
    }
    static untrack(id) {
        const g = this.active.get(id);
        if (g?.messageID)
            this.byMessage.delete(g.messageID);
        this.active.delete(id);
    }
    /** Loads every active giveaway into memory. */
    static async loadActive() {
        this.active.clear();
        this.byMessage.clear();
        const rows = await this.repo().find({ where: { hasEnded: false } });
        for (const g of rows)
            this.track(g);
        return rows;
    }
    /** Active giveaways currently held in memory. */
    static activeGiveaways() {
        return [...this.active.values()];
    }
    /**
     * Gets an existing giveaway.
     * @param id The id of the giveaway to get.
     */
    static async get(id) {
        if (!id)
            return null;
        return this.active.get(id) ?? (await this.repo().findOneBy({ id }));
    }
    /**
     * Gets a giveaway by the message it is attached to.
     */
    static async getByMessage(messageID, channelID) {
        const id = this.byMessage.get(messageID);
        const cached = id ? this.active.get(id) : undefined;
        if (cached)
            return cached;
        const where = { messageID };
        if (channelID)
            where.channelID = channelID;
        return (await this.repo().findOne({ where: where })) ?? null;
    }
    /** Gets all existing giveaways. */
    static async getAll() {
        return await this.repo().find();
    }
    /**
     * Finds existing giveaways matching the provided data.
     * @param data The data to use for searching.
     * @param amount The amount of results to return.
     */
    static async find(data, amount) {
        return await this.repo().find({ where: data, take: amount });
    }
    /**
     * Saves a giveaway in the database.
     * @param data The giveaway data to save.
     */
    static async set(data) {
        const repo = this.repo();
        if (this.driver === "mongodb") {
            const existing = await repo.findOneBy({ id: data.id });
            if (existing) {
                const { mongoId: _ignored, ...rest } = data;
                await repo.update({ id: data.id }, rest);
            }
            else {
                await repo.save(data);
            }
        }
        else {
            await repo.save(data);
        }
        this.track(data);
    }
    /**
     * Deletes an existing giveaway from the database.
     * @param id The id of the giveaway to delete.
     */
    static async delete(id) {
        this.untrack(id);
        return await this.repo().delete({ id });
    }
    /** Deletes several giveaways by id. */
    static async deleteMany(ids) {
        let affected = 0;
        for (const id of ids)
            affected += (await this.delete(id)).affected ?? 0;
        return affected;
    }
    /**
     * Wipes the entire database.
     */
    static async wipe() {
        this.active.clear();
        this.byMessage.clear();
        return await this.repo().clear();
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map