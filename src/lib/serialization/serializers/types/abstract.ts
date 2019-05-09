import { Type } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

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
