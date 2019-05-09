import { TypeOperatorType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class TypeOperatorTypeSerializer extends TypeSerializerComponent<TypeOperatorType> {
    supports(t: unknown) {
        return t instanceof TypeOperatorType;
    }

    toObject(type: TypeOperatorType, obj: Pick<JSONOutput.TypeOperatorType, 'type'>): JSONOutput.TypeOperatorType {
        return {
            ...obj,
            operator: type.operator,
            target: this.owner.toObject(type.target)
        };
    }
}
