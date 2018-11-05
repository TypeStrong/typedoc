import { Component } from '../../../utils/component';
import { Type } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:type'})
export class TypeSerializer extends TypeSerializerComponent<Type> {

  static PRIORITY = 1000;

  supports(t: unknown) {
    return t instanceof Type;
  }

  toObject(type: Type, obj?: any): any {
    obj = obj || {};

    obj.type = type.type;

    return obj;
  }

}
