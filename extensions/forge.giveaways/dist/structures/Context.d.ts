import { Context as BaseContext, IContextCache } from "@tryforge/forgescript";
import { ExtendedStates, IExtendedRunnable } from "../types";
import { Giveaway, IGiveawayBonusEntry, IGiveawayDisplay, IGiveawayRequirements } from "./Giveaway";
export type { IGiveawayRequirements } from "./Giveaway";
export interface IExtendedContextCache extends IContextCache {
    giveaway: Giveaway | null;
}
/**
 * Options collected by builder functions (`$addBonusEntries`, `$setMaxEntries`,
 * `$setGiveawayDescription`, ...) before `$startGiveaway`/`$editGiveaway`.
 */
export interface IGiveawayBuilder {
    bonusEntries?: IGiveawayBonusEntry[];
    maxEntries?: number | null;
    display?: IGiveawayDisplay;
}
export declare class Context extends BaseContext {
    #private;
    readonly runtime: IExtendedRunnable;
    constructor(runtime: IExtendedRunnable);
    get obj(): import("../types").ExtendedSendable;
    get extendedStates(): ExtendedStates | undefined;
    get giveaway(): Giveaway | null;
}
declare module "@tryforge/forgescript" {
    interface Context {
        giveaway: Giveaway | null;
        extendedStates?: ExtendedStates;
        requirements?: Partial<IGiveawayRequirements>;
        giveawayBuilder?: IGiveawayBuilder;
    }
}
//# sourceMappingURL=Context.d.ts.map