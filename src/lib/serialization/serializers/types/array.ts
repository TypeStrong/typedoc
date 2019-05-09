import { ArrayType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class ArrayTypeSerializer extends TypeSerializerComponent<ArrayType> {
    supports(t: unknown) {
        return t instanceof ArrayType;
    }

    /**
     * Will be run after [[TypeSerializer]] so `type` will already be set.
     * @param type
     * @param obj
     */
    toObject(type: ArrayType, obj: Pick<JSONOutput.ArrayType, 'type'>): JSONOutput.ArrayType {
        return {
            ...obj,
            elementType: this.owner.toObject(type.elementType)
        };
    }
}
