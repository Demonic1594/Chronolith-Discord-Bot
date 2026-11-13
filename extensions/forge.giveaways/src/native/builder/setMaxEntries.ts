import { ArgType, NativeFunction } from "@tryforge/forgescript"
import builder from "../../functions/builder"

export default new NativeFunction({
    name: "$setMaxEntries",
    version: "2.0.0",
    description: "Caps how many members can enter; 0 removes the cap",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "amount",
            description: "The maximum number of entries",
            rest: false,
            required: true,
            type: ArgType.Number,
        },
    ],
    execute(ctx, [amount]) {
        if (!Number.isInteger(amount) || amount < 0) return this.customError("Amount must be a whole number of at least 0")
        builder(ctx).maxEntries = amount || null
        return this.success()
    }
})
