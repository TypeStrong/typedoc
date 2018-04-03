import { Component } from '../../../utils/component';
import { CommentTag } from '../../../models';

import { SerializerComponent } from '../../components';

@Component({name: 'serializer:comment-tag'})
export class CommentTagSerializer extends SerializerComponent<CommentTag> {

  static PRIORITY = 1000;

  /**
   * Filter for instances of [[CommentTag]]
   */
  protected static serializeGroup(instance: any): boolean {
    return instance instanceof CommentTag;
  }

  // use same fn for every instance
  serializeGroup = CommentTagSerializer.serializeGroup;
  serializeGroupSymbol = CommentTag;

  initialize(): void {
    super.initialize();
    this.supports = (r: CommentTag) => true;
  }

  toObject(tag: CommentTag, obj?: any): any {
    obj = obj || {};

    obj.tag = tag.tagName;
    obj.text = tag.text;

    if (tag.paramName) {
      obj.param = tag.paramName;
    }

    return obj;
  }
}
