"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const builder_1 = require("../../functions/builder");
const utils_1 = require("../../utils");
exports.default = new forgescript_1.NativeFunction({
    name: "$addRestrictedRoles",
    version: "1.0.0",
    description: "Adds restricted roles to the giveaway being started or edited, accepts role IDs or mentions",
    aliases: ["$addRestrictedRole"],
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "roles",
            description: "The roles to add as restriction",
            rest: true,
            required: true,
            type: forgescript_1.ArgType.String,
        },
    ],
    execute(ctx, [roles]) {
        const req = (0, builder_1.requirements)(ctx);
        const set = new Set(req.restrictedRoles);
        for (const role of roles) {
            const id = (0, utils_1.parseSnowflake)(role);
            if (!id)
                return this.customError(`Invalid role ID: ${role}`);
            set.add(id);
        }
        req.restrictedRoles = [...set];
        return this.success();
    }
});
//# sourceMappingURL=addRestrictedRoles.js.map