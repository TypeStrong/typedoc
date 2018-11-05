import { Component } from '../../../utils/component';
import { CommentTag } from '../../../models';

import { SerializerComponent } from '../../components';

@Component({name: 'serializer:comment-tag'})
export class CommentTagSerializer extends SerializerComponent<CommentTag> {

  static PRIORITY = 1000;

  /**
   * Filter for instances of [[CommentTag]]
   */
  serializeGroup(instance: unknown): boolean {
    return instance instanceof CommentTag;
  }

  serializeGroupSymbol = CommentTag;

  supports(t: unknown) {
    return true;
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
