import { ArgType, NativeFunction } from "@tryforge/forgescript"
import builder from "../../functions/builder"
import { parseSnowflake } from "../../utils"

export default new NativeFunction({
    name: "$addBonusEntries",
    version: "2.0.0",
    description: "Gives members with a role extra entries (tickets); bonuses from several roles add up",
    aliases: ["$addBonusEntry"],
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "role ID",
            description: "The role granting the bonus",
            rest: false,
            required: true,
            type: ArgType.String,
        },
        {
            name: "amount",
            description: "How many extra entries the role gives",
            rest: false,
            required: true,
            type: ArgType.Number,
        },
    ],
    execute(ctx, [role, amount]) {
        const roleID = parseSnowflake(role)
        if (!roleID) return this.customError(`Invalid role ID: ${role}`)
        if (!Number.isInteger(amount) || amount < 1) return this.customError("Amount must be a whole number of at least 1")
        const b = builder(ctx)
        b.bonusEntries = [...(b.bonusEntries ?? []).filter((x) => x.roleID !== roleID), { roleID, amount }]
        return this.success()
    }
})
