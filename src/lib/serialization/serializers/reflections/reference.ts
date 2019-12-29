import { Component } from '../../../utils/component';
import { ReferenceReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';

@Component({ name: 'serializer:reference-reflection' })
export class ReferenceReflectionSerializer extends ReflectionSerializerComponent<ReferenceReflection> {
    supports(t: unknown) {
        return t instanceof ReferenceReflection;
    }

    toObject(ref: ReferenceReflection, obj?: any): any {
        return {
            ...obj,
            target: ref.getTargetReflection().id
        };
    }
}
