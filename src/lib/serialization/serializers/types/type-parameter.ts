import { Component } from '../../../utils/component';
import { TypeParameterType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:type-parameter-type'})
export class TypeParameterTypeSerializer extends TypeSerializerComponent<TypeParameterType> {

  initialize(): void {
    super.initialize();
    this.supports = (t: TypeParameterType) => t instanceof TypeParameterType;
  }

  toObject(typeParameter: TypeParameterType, obj?: any): any {
    obj = obj || {};

    obj.name = typeParameter.name;

    if (typeParameter.constraint) {
      obj.constraint = this.owner.toObject(typeParameter.constraint);
    }

    return obj;
  }

}
