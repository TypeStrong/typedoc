import { ReferenceReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';

export class ReferenceReflectionSerializer extends ReflectionSerializerComponent<ReferenceReflection> {
    supports(t: unknown) {
        return t instanceof ReferenceReflection;
    }

    toObject(ref: ReferenceReflection, obj?: any): any {
        return {
            ...obj,
            target: ref.tryGetTargetReflection()?.id ?? -1
        };
    }
}
