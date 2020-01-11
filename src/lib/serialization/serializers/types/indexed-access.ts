import { IndexedAccessType } from '../../../models';
import { TypeSerializerComponent } from '../../components';

export class IndexedAccessTypeSerializer extends TypeSerializerComponent<IndexedAccessType> {
    supports(item: unknown): boolean {
        return item instanceof IndexedAccessType;
    }

    toObject(type: IndexedAccessType, obj?: any): any {
        return {
            ...obj,
            indexType: this.owner.toObject(type.indexType),
            objectType: this.owner.toObject(type.objectType)
        };
    }
}
