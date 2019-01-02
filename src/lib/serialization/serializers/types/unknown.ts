import { Component } from '../../../utils/component';
import { UnknownType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

@Component({ name: 'serializer:unknown-type' })
export class UnknownTypeSerializer extends TypeSerializerComponent<UnknownType> {
    supports(t: unknown) {
        return t instanceof UnknownType;
    }

    /**
     * Will be run after [[TypeSerializer]] so `type` will already be set.
     * @param type
     * @param obj
     */
    toObject(type: UnknownType, obj: Pick<JSONOutput.UnknownType, 'type'>): JSONOutput.UnknownType {
        return {
            ...obj,
            name: type.name
        };
    }
}
