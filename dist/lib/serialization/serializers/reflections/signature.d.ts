import { SignatureReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class SignatureReflectionSerializer extends ReflectionSerializerComponent<SignatureReflection> {
    supports(t: unknown): boolean;
    toObject(signature: SignatureReflection, obj?: any): any;
}
