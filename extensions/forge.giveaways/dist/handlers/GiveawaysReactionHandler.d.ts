import { ForgeClient } from "@tryforge/forgescript";
/**
 * Handles reaction based entries. Reacting joins, removing the reaction
 * leaves. Members who don't meet the requirements get their reaction removed.
 */
export declare class GiveawaysReactionHandler {
    private readonly client;
    constructor(client: ForgeClient);
    private get ext();
    private matches;
    private add;
    private remove;
}
//# sourceMappingURL=GiveawaysReactionHandler.d.ts.map