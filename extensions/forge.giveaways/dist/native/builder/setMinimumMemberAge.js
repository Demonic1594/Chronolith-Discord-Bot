"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const builder_1 = require("../../functions/builder");
exports.default = new forgescript_1.NativeFunction({
    name: "$setMinimumMemberAge",
    version: "2.0.0",
    description: "Sets the minimum time a member must have been in the server to enter",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "time",
            description: "The minimum age, e.g. 7d",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Time,
        },
    ],
    execute(ctx, [time]) {
        if (!(time >= 0))
            return this.customError("Time must not be negative");
        (0, builder_1.requirements)(ctx).minMemberAge = time;
        return this.success();
    }
});
//# sourceMappingURL=setMinimumMemberAge.js.map