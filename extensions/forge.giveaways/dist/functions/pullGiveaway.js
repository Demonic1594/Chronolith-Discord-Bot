"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const structures_1 = require("../structures");
/** Gets a giveaway by id, or the giveaway of the current event. */
async function default_1(ctx, id) {
    return id ? await structures_1.Database.get(id) : ctx.giveaway ?? ctx.extendedStates?.giveaway?.new ?? null;
}
//# sourceMappingURL=pullGiveaway.js.map