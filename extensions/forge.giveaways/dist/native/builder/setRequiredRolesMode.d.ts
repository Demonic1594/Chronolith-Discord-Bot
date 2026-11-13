import { ArgType, NativeFunction } from "@tryforge/forgescript";
export declare enum RequiredRolesModeType {
    all = "all",
    any = "any"
}
declare const _default: NativeFunction<[{
    name: string;
    description: string;
    rest: false;
    required: true;
    type: ArgType.Enum;
    enum: typeof RequiredRolesModeType;
}], true>;
export default _default;
//# sourceMappingURL=setRequiredRolesMode.d.ts.map