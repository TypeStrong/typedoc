import { Component } from '../../../utils/component';
import { ConditionalType } from '../../../models';
import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:conditional-type'})
export class ConditionalTypeSerializer extends TypeSerializerComponent<ConditionalType> {

  initialize(): void {
    super.initialize();
    this.supports = (t: ConditionalType) => t instanceof ConditionalType;
  }

  toObject(conditional: ConditionalType, obj?: any): any {
    obj = obj || {};

    obj.checkType = this.owner.toObject(conditional.checkType);
    obj.extendsType = this.owner.toObject(conditional.extendsType);
    obj.trueType = this.owner.toObject(conditional.trueType);
    obj.falseType = this.owner.toObject(conditional.falseType);

    return obj;
  }

}
