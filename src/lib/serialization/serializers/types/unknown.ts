import { Component } from '../../../utils/component';
import { UnknownType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:unknown-type'})
export class UnknownTypeSerializer extends TypeSerializerComponent<UnknownType> {

  supports(t: unknown) {
    return t instanceof UnknownType;
  }

  toObject(unknown: UnknownType, obj?: any): any {
    obj = obj || {};

    obj.name = unknown.name;

    return obj;
  }

}
