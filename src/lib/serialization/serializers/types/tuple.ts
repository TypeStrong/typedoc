import { TupleType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class TupleTypeSerializer extends TypeSerializerComponent<TupleType> {
    supports(t: unknown) {
        return t instanceof TupleType;
    }

    toObject(tuple: TupleType, obj: Pick<JSONOutput.TupleType, 'type'>): JSONOutput.TupleType {
        const result: JSONOutput.TupleType = { ...obj };

        if (tuple.elements && tuple.elements.length > 0) {
            result.elements = tuple.elements.map(t => this.owner.toObject(t));
        }

        return result;
    }
}
