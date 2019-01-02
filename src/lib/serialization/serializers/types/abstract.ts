import { Component } from '../../../utils/component';
import { Type } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

@Component({ name: 'serializer:type' })
export class TypeSerializer extends TypeSerializerComponent<Type> {
    static PRIORITY = 1000;

    supports(t: unknown) {
        return t instanceof Type;
    }

    toObject(type: Type, obj?: Partial<JSONOutput.Type<Type>>): JSONOutput.Type<Type> {
        return {
            ...obj,
            type: type.type
        };
    }
}
