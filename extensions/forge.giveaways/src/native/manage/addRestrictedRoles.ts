import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { requirements } from "../../functions/builder"
import { parseSnowflake } from "../../utils"

export default new NativeFunction({
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
            type: ArgType.String,
        },
    ],
    execute(ctx, [roles]) {
        const req = requirements(ctx)
        const set = new Set(req.restrictedRoles)
        for (const role of roles) {
            const id = parseSnowflake(role)
            if (!id) return this.customError(`Invalid role ID: ${role}`)
            set.add(id)
        }
        req.restrictedRoles = [...set]
        return this.success()
    }
})
