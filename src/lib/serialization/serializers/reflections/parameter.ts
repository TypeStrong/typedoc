import { Component } from '../../../utils/component';
import { ParameterReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';

@Component({name: 'serializer:parameter-reflection'})
export class ParameterReflectionSerializer extends ReflectionSerializerComponent<ParameterReflection> {

  initialize(): void {
    super.initialize();
    this.supports = (r: ParameterReflection) => r instanceof ParameterReflection;
  }

  toObject(parameter: ParameterReflection, obj?: any): any {
    obj = obj || {};

    if (parameter.type) {
      obj.type = this.owner.toObject(parameter.type);
    }

    if (parameter.defaultValue) {
      obj.defaultValue = parameter.defaultValue;
    }

    return obj;
  }

}
