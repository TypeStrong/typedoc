import { Component } from '../../utils/component';
import { ReflectionCategory } from '../../models/ReflectionCategory';

import { SerializerComponent } from '../components';

@Component({name: 'serializer:reflection-category'})
export class ReflectionCategorySerializer extends SerializerComponent<ReflectionCategory> {

  static PRIORITY = 1000;

  /**
   * Filter for instances of [[ReflectionCategory]]
   */
  serializeGroup(instance: any): boolean {
    return instance instanceof ReflectionCategory;
  }

  serializeGroupSymbol = ReflectionCategory;

  initialize(): void {
    super.initialize();
  }

  supports(r: unknown) {
    return r instanceof ReflectionCategory;
  }

  toObject(category: ReflectionCategory, obj?: any): any {
    obj = obj || {};

    Object.assign(obj, {
      title: category.title
    });

    if (category.children && category.children.length > 0) {
      obj.children = category.children.map( child => child.id );
    }

    return obj;
  }

}
