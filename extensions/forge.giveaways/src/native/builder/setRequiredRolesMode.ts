import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { requirements } from "../../functions/builder"

export enum RequiredRolesModeType {
    all = "all",
    any = "any",
}

export default new NativeFunction({
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
            type: ArgType.Enum,
            enum: RequiredRolesModeType,
        },
    ],
    execute(ctx, [mode]) {
        requirements(ctx).requiredRolesMode = mode
        return this.success()
    }
})
