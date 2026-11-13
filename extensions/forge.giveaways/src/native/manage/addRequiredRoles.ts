import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { requirements } from "../../functions/builder"
import { parseSnowflake } from "../../utils"

export default new NativeFunction({
    name: "$addRequiredRoles",
    version: "1.0.0",
    description: "Adds required roles to the giveaway being started or edited, accepts role IDs or mentions",
    aliases: ["$addRequiredRole"],
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "roles",
            description: "The roles to add as requirement",
            rest: true,
            required: true,
            type: ArgType.String,
        },
    ],
    execute(ctx, [roles]) {
        const req = requirements(ctx)
        const set = new Set(req.requiredRoles)
        for (const role of roles) {
            const id = parseSnowflake(role)
            if (!id) return this.customError(`Invalid role ID: ${role}`)
            set.add(id)
        }
        req.requiredRoles = [...set]
        return this.success()
    }
})
