import { ParameterReflection } from "../../../models";

import { ReflectionSerializerComponent } from "../../components";
import {
    ParameterReflection as JSONParameterReflection,
    Reflection as JSONReflection,
} from "../../schema";

export class ParameterReflectionSerializer extends ReflectionSerializerComponent<
    ParameterReflection
> {
    supports(t: unknown) {
        return t instanceof ParameterReflection;
    }

    toObject(
        parameter: ParameterReflection,
        obj: JSONReflection
    ): JSONParameterReflection {
        const result: JSONParameterReflection = {
            ...obj,
        };

        if (parameter.type) {
            result.type = this.owner.toObject(parameter.type);
        }

        if (parameter.defaultValue) {
            result.defaultValue = parameter.defaultValue;
        }

        return result;
    }
}
