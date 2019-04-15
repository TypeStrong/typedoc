import { SerializerComponent } from '../../components';
import { SourceReferenceWrapper } from '../models/source-reference-wrapper';
export declare class SourceReferenceContainerSerializer extends SerializerComponent<SourceReferenceWrapper> {
    static PRIORITY: number;
    serializeGroupSymbol: typeof SourceReferenceWrapper;
    serializeGroup(instance: unknown): boolean;
    supports(t: unknown): boolean;
    toObject(sourceReferenceContainer: SourceReferenceWrapper, obj?: any): any;
}
