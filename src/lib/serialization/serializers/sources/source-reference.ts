import { Component } from '../../../utils/component';

import { SerializerComponent } from '../../components';
import { SourceReferenceWrapper } from '../models';
import { JSONOutput } from '../../schema';

@Component({ name: 'serializer:source-reference-container' })
export class SourceReferenceContainerSerializer extends SerializerComponent<SourceReferenceWrapper> {
    static PRIORITY = 1000;

    serializeGroup(instance: unknown) {
        return instance instanceof SourceReferenceWrapper;
    }

    supports(_: unknown) {
        return true;
    }

    toObject({ sourceReference: ref }: SourceReferenceWrapper, obj?: Partial<JSONOutput.SourceReference>): JSONOutput.SourceReference {
        return {
            ...obj,
            fileName: ref.fileName,
            line: ref.line,
            character: ref.character
        };
    }
}
