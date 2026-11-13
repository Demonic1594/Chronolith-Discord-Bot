"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredRolesModeType = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const builder_1 = require("../../functions/builder");
var RequiredRolesModeType;
(function (RequiredRolesModeType) {
    RequiredRolesModeType["all"] = "all";
    RequiredRolesModeType["any"] = "any";
})(RequiredRolesModeType || (exports.RequiredRolesModeType = RequiredRolesModeType = {}));
exports.default = new forgescript_1.NativeFunction({
    name: "$setRequiredRolesMode",
    version: "2.0.0",
    description: "Sets whether entrants need all (default) or any of the required roles",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "mode",
            description: "all or any",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Enum,
            enum: RequiredRolesModeType,
        },
    ],
    execute(ctx, [mode]) {
        (0, builder_1.requirements)(ctx).requiredRolesMode = mode;
        return this.success();
    }
});
//# sourceMappingURL=setRequiredRolesMode.js.map