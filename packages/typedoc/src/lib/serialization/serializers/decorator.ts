import { Component } from '../../utils/component';

import { SerializerComponent } from '../components';
import { DecoratorWrapper } from './models/decorator-wrapper';

@Component({name: 'serializer:decorator-container'})
export class DecoratorContainerSerializer extends SerializerComponent<DecoratorWrapper> {

  static PRIORITY = 1000;

  /**
   * Filter for instances of [[DecoratorWrapper]]
   */
  protected static serializeGroup(instance: any): boolean {
    return instance instanceof DecoratorWrapper;
  }

  // use same fn for every instance
  serializeGroup = DecoratorContainerSerializer.serializeGroup;
  serializeGroupSymbol = DecoratorWrapper;

  initialize(): void {
      super.initialize();
      this.supports = (s: DecoratorWrapper) => s instanceof DecoratorWrapper;
  }

  toObject(decoratorWrapper: DecoratorWrapper, obj?: any): any {
      obj = obj || {};

      const decorator = decoratorWrapper.decorator;
      obj.name = decorator.name;

      if (decorator.type) {
        obj.type = this.owner.toObject(decorator.type);
      }

      if (decorator.arguments) {
        obj.arguments = decorator.arguments;
      }

      return obj;
  }

}
