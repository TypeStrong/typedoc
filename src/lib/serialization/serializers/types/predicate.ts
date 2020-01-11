import { PredicateType } from '../../../models';
import { TypeSerializerComponent } from '../../components';

export class PredicateTypeSerializer extends TypeSerializerComponent<PredicateType> {
    supports(t: unknown) {
        return t instanceof PredicateType;
    }

    toObject(type: PredicateType, obj?: any): any {
        return {
            ...obj,
            name: type.name,
            asserts: type.asserts,
            targetType: type.targetType ? this.owner.toObject(type.targetType) : undefined
        };
    }
}
