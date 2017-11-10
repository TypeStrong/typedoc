import { Component } from '../../../utils/component';
import { Type } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:type'})
export class TypeSerializer extends TypeSerializerComponent<Type> {

  static PRIORITY = 1000;

  initialize(): void {
    super.initialize();
    this.supports = (t: Type) => true;
  }

  toObject(type: Type, obj?: any): any {
    obj = obj || {};

    obj.type = type.type;

    return obj;
  }

}
