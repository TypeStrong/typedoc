import { Component } from '../../../utils/component';
import { TypeOperatorType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:type-operator-type'})
export class TypeOperatorTypeSerializer extends TypeSerializerComponent<TypeOperatorType> {

  initialize(): void {
    super.initialize();
    this.supports = (t: TypeOperatorType) => t instanceof TypeOperatorType;
  }

  toObject(typeOperator: TypeOperatorType, obj?: any): any {
    obj = obj || {};

    obj.operator = typeOperator.operator;
    obj.target = this.owner.toObject(typeOperator.target);

    return obj;
  }

}
