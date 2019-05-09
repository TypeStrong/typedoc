import { ReferenceType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class ReferenceTypeSerializer extends TypeSerializerComponent<ReferenceType> {
    supports(t: unknown) {
        return t instanceof ReferenceType;
    }

    toObject(
        type: ReferenceType,
        obj: Pick<JSONOutput.ReferenceType, 'type'> & Partial<JSONOutput.ReferenceType>
    ): JSONOutput.ReferenceType {
        if (type.reflection) {
            obj.id = type.reflection.id;
        }

        if (type.typeArguments && type.typeArguments.length > 0) {
            obj.typeArguments = type.typeArguments.map(t => this.owner.toObject(t));
        }

        return {
            ...obj,
            name: type.name
        };
    }
}
