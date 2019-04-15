import { DeclarationReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class DeclarationReflectionSerializer extends ReflectionSerializerComponent<DeclarationReflection> {
    static PRIORITY: number;
    supports(t: unknown): boolean;
    toObject(declaration: DeclarationReflection, obj?: any): any;
}
