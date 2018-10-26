import { Component } from '../../../utils/component';
import { TypeParameterReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';

@Component({name: 'serializer:type-parameter-reflection'})
export class TypeParameterReflectionSerializer extends ReflectionSerializerComponent<TypeParameterReflection> {

  supports(t: unknown) {
    return t instanceof TypeParameterReflection;
  }

  toObject(typeParameter: TypeParameterReflection, obj?: any): any {
    obj = obj || {};

    if (typeParameter.type) {
      obj.type = this.owner.toObject(typeParameter.type);
    }

    return obj;
  }

}
