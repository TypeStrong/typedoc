import { Component } from '../../../utils/component';
import { TypeParameterType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

@Component({ name: 'serializer:type-parameter-type' })
export class TypeParameterTypeSerializer extends TypeSerializerComponent<TypeParameterType> {
    supports(t: unknown) {
        return t instanceof TypeParameterType;
    }

    toObject(type: TypeParameterType, obj: Pick<JSONOutput.TypeParameterType, 'type'>): JSONOutput.TypeParameterType {
        const result: JSONOutput.TypeParameterType = {
            ...obj,
            name: type.name
        };

        if (type.constraint) {
            result.constraint = this.owner.toObject(type.constraint);
        }

        return result;
    }
}
