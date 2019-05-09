import { IntrinsicType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class IntrinsicTypeSerializer extends TypeSerializerComponent<IntrinsicType> {
    supports(t: unknown) {
        return t instanceof IntrinsicType;
    }

    /**
     * Will be run after [[TypeSerializer]] so `type` will already be set.
     * @param type
     * @param obj
     */
    toObject(type: IntrinsicType, obj: Pick<JSONOutput.IntrinsicType, 'type'>): JSONOutput.IntrinsicType {
        return {
            ...obj,
            name: type.name
        };
    }
}
