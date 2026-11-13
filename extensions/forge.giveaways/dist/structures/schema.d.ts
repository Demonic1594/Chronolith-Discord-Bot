import { EntitySchema } from "typeorm";
import { Giveaway } from "./Giveaway";
export type DriverKind = "sqlite" | "mysql" | "postgres" | "mongodb";
/**
 * Builds the TypeORM schema for a driver. Table names match the decorator
 * based entities of the original extension ("giveaway" and "mongo_giveaway"),
 * so existing databases are upgraded in place by TypeORM's synchronize.
 */
export declare function createGiveawaySchema(driver: DriverKind): EntitySchema<Giveaway>;
//# sourceMappingURL=schema.d.ts.map