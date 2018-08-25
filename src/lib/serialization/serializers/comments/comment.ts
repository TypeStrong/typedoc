import { Component } from '../../../utils/component';
import { Comment } from '../../../models';

import { SerializerComponent } from '../../components';

@Component({name: 'serializer:comment'})
export class CommentSerializer extends SerializerComponent<Comment> {

  static PRIORITY = 1000;

  /**
   * Filter for instances of [[Comment]]
   */
  serializeGroup(instance: unknown): boolean {
    return instance instanceof Comment;
  }

  supports(t: unknown) {
    return true;
  }

  serializeGroupSymbol = Comment;

  toObject(comment: Comment, obj?: any): any {
    obj = obj || {};

    if (comment.shortText) {
      obj.shortText = comment.shortText;
    }
    if (comment.text) {
      obj.text      = comment.text;
    }
    if (comment.returns) {
      obj.returns   = comment.returns;
    }

    if (comment.tags && comment.tags.length) {
      obj.tags = [];
      comment.tags.forEach((tag) => obj.tags.push(this.owner.toObject(tag)));
    }
    return obj;
  }
}
