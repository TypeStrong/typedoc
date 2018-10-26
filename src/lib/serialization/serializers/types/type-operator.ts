import { Component } from '../../../utils/component';
import { TypeOperatorType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:type-operator-type'})
export class TypeOperatorTypeSerializer extends TypeSerializerComponent<TypeOperatorType> {

  supports(t: unknown) {
    return t instanceof TypeOperatorType;
  }

  toObject(typeOperator: TypeOperatorType, obj?: any): any {
    obj = obj || {};

    obj.operator = typeOperator.operator;
    obj.target = this.owner.toObject(typeOperator.target);

    return obj;
  }

}
