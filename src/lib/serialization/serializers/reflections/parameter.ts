import { ParameterReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class ParameterReflectionSerializer extends ReflectionSerializerComponent<ParameterReflection> {
    supports(t: unknown) {
        return t instanceof ParameterReflection;
    }

    toObject(parameter: ParameterReflection, obj: JSONOutput.Reflection): JSONOutput.ParameterReflection {
        const result: JSONOutput.ParameterReflection = {
            ...obj
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
