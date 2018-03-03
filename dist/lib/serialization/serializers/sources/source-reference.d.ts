import { SerializerComponent } from '../../components';
import { SourceReferenceWrapper } from '../models/source-reference-wrapper';
export declare class SourceReferenceContainerSerializer extends SerializerComponent<SourceReferenceWrapper> {
    static PRIORITY: number;
    serializeGroup: (instance: any) => boolean;
    serializeGroupSymbol: typeof SourceReferenceWrapper;
    initialize(): void;
    toObject(sourceReferenceContainer: SourceReferenceWrapper, obj?: any): any;
}
