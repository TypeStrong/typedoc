import { TypeParameterReflection } from "../../../models";

import { ReflectionSerializerComponent } from "../../components";
import {
    TypeParameterReflection as JSONTypeParameterReflection,
    Reflection as JSONReflection,
} from "../../schema";

export class TypeParameterReflectionSerializer extends ReflectionSerializerComponent<
    TypeParameterReflection
> {
    supports(t: unknown) {
        return t instanceof TypeParameterReflection;
    }

    toObject(
        typeParameter: TypeParameterReflection,
        obj: JSONReflection
    ): JSONTypeParameterReflection {
        const result: JSONTypeParameterReflection = { ...obj };

        if (typeParameter.type) {
            result.type = this.owner.toObject(typeParameter.type);
        }
        if (typeParameter.default) {
            result.default = this.owner.toObject(typeParameter.default);
        }

        return result;
    }
}
