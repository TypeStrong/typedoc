import { SignatureReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { SignatureReflection as JSONSignatureReflection, Reflection as JSONReflection } from '../../schema';

export class SignatureReflectionSerializer extends ReflectionSerializerComponent<SignatureReflection> {
    supports(t: unknown) {
        return t instanceof SignatureReflection;
    }

    toObject(signature: SignatureReflection, obj: JSONReflection): JSONSignatureReflection {
        const result: JSONSignatureReflection = { ...obj };

        if (signature.type) {
            result.type = this.owner.toObject(signature.type);
        }

        if (signature.overwrites) {
            result.overwrites = this.owner.toObject(signature.overwrites);
        }

        if (signature.inheritedFrom) {
            result.inheritedFrom = this.owner.toObject(signature.inheritedFrom);
        }

        if (signature.implementationOf) {
            result.implementationOf = this.owner.toObject(signature.implementationOf);
        }

        return result;
    }
}
