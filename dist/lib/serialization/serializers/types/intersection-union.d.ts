import { IntersectionType, UnionType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare type IntersectionUnion = IntersectionType | UnionType;
export declare class IntersectionTypeSerializer extends TypeSerializerComponent<IntersectionUnion> {
    supports(t: unknown): boolean;
    toObject(intersectionUnion: IntersectionUnion, obj?: any): any;
}
