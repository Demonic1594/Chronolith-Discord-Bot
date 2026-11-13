import { Context as BaseContext, IContextCache } from "@tryforge/forgescript"
import { ExtendedStates, IExtendedRunnable } from "../types"
import { Giveaway, IGiveawayBonusEntry, IGiveawayDisplay, IGiveawayRequirements } from "./Giveaway"

export type { IGiveawayRequirements } from "./Giveaway"

export interface IExtendedContextCache extends IContextCache {
    giveaway: Giveaway | null
}

/**
 * Options collected by builder functions (`$addBonusEntries`, `$setMaxEntries`,
 * `$setGiveawayDescription`, ...) before `$startGiveaway`/`$editGiveaway`.
 */
export interface IGiveawayBuilder {
    bonusEntries?: IGiveawayBonusEntry[]
    maxEntries?: number | null
    display?: IGiveawayDisplay
}

export class Context extends BaseContext {
    #cache: Partial<IExtendedContextCache> = {}

    public constructor(public readonly runtime: IExtendedRunnable) {
        super(runtime)
    }

    public get obj() {
        return this.runtime.obj
    }

    public get extendedStates() {
        return this.runtime.states
    }

    public get giveaway() {
        return (this.#cache.giveaway ??=
            "giveaway" in this.obj
                ? this.obj.giveaway as Giveaway
                : this.obj instanceof Giveaway
                    ? this.obj
                    : null)
    }
}

declare module "@tryforge/forgescript" {
    interface Context {
        giveaway: Giveaway | null
        extendedStates?: ExtendedStates
        requirements?: Partial<IGiveawayRequirements>
        giveawayBuilder?: IGiveawayBuilder
    }
}
