import { IntrinsicType, type SomeType, UnionType } from "../../models";

export function removeUndefined(type: SomeType): SomeType {
    if (type instanceof UnionType) {
        const types = type.types.filter((t) => {
            if (t instanceof IntrinsicType) {
                return t.name !== "undefined";
            }
            return true;
        });
        if (types.length === 1) {
            return types[0];
        }
        type.types = types;
        return type;
    }
    return type;
}
