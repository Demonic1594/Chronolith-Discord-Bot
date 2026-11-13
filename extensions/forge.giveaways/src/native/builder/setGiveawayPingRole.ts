import { ArgType, NativeFunction } from "@tryforge/forgescript"
import builder from "../../functions/builder"
import { parseSnowflake } from "../../utils"

export default new NativeFunction({
    name: "$setGiveawayPingRole",
    version: "2.0.0",
    description: "Sets a role pinged when the giveaway starts (default messages only)",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "role ID",
            description: "The role to ping",
            rest: false,
            required: true,
            type: ArgType.String,
        },
    ],
    execute(ctx, [role]) {
        const roleID = parseSnowflake(role)
        if (!roleID) return this.customError(`Invalid role ID: ${role}`)
        const b = builder(ctx)
        b.display = { ...b.display, pingRoleID: roleID }
        return this.success()
    }
})
