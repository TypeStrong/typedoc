import { Component } from '../../../utils/component';

import { SerializerComponent } from '../../components';
import { SourceReferenceWrapper } from '../models/source-reference-wrapper';

@Component({name: 'serializer:source-reference-container'})
export class SourceReferenceContainerSerializer extends SerializerComponent<SourceReferenceWrapper> {

  static PRIORITY = 1000;

  serializeGroup = instance => instance instanceof SourceReferenceWrapper;
  serializeGroupSymbol = SourceReferenceWrapper;

  initialize(): void {
      super.initialize();
      this.supports = (s: SourceReferenceWrapper) => s instanceof SourceReferenceWrapper;
  }

  toObject(sourceReferenceContainer: SourceReferenceWrapper, obj?: any): any {
      obj = obj || {};

      const sourceReference = sourceReferenceContainer.sourceReference;
      obj.fileName = sourceReference.fileName;
      obj.line = sourceReference.line;
      obj.character = sourceReference.character;

      return obj;
  }
}
