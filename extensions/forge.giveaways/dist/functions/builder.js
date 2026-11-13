"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = builder;
exports.requirements = requirements;
/** Returns the giveaway builder of a context, creating it on first use. */
function builder(ctx) {
    return (ctx.giveawayBuilder ??= {});
}
/** Returns the requirements of a context, creating them on first use. */
function requirements(ctx) {
    return (ctx.requirements ??= {});
}
//# sourceMappingURL=builder.js.map