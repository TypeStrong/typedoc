import { InferredType } from '../../../models';
import { TypeSerializerComponent } from '../../components';

export class InferredTypeSerializer extends TypeSerializerComponent<InferredType> {
    supports(item: unknown): boolean {
        return item instanceof InferredType;
    }

    toObject(inferred: InferredType, obj?: any): any {
        return {
            ...obj,
            name: inferred.name
        };
    }
}
