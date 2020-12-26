import { IntrinsicType, Type, UnionType } from "../../models";

export function removeUndefined(type: Type) {
    if (type instanceof UnionType) {
        const types = type.types.filter(
            (t) => !t.equals(new IntrinsicType("undefined"))
        );
        if (types.length === 1) {
            return types[0];
        }
        type.types = types;
        return type;
    }
    return type;
}
