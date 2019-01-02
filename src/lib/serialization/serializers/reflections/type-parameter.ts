import { Component } from '../../../utils/component';
import { TypeParameterReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

@Component({ name: 'serializer:type-parameter-reflection' })
export class TypeParameterReflectionSerializer extends ReflectionSerializerComponent<
    TypeParameterReflection
> {
    supports(t: unknown) {
        return t instanceof TypeParameterReflection;
    }

    toObject(typeParameter: TypeParameterReflection, obj: JSONOutput.Reflection): JSONOutput.TypeParameterReflection {
        const result: JSONOutput.TypeParameterReflection = { ...obj };

        if (typeParameter.type) {
            result.type = this.owner.toObject(typeParameter.type);
        }

        return result;
    }
}
