import { DeclarationReflection, ReflectionType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class ReflectionTypeSerializer extends TypeSerializerComponent<ReflectionType> {
    private visited = new Set<DeclarationReflection>();

    supports(t: unknown) {
        return t instanceof ReflectionType;
    }

    toObject(reference: ReflectionType, obj: Pick<JSONOutput.ReflectionType, 'type'>): JSONOutput.ReflectionType {
        const result: JSONOutput.ReflectionType = {
            ...obj
        };

        // Because `DeclarationReflection` has reference to multiple types objectifying a declaration
        // on a type might fall into a loop trap (cyclic dependency).
        // The TypeDoc code does not apply logic that can create this scenario but a 3rd party plugin
        // might do that unintentionally so a protection is in place.
        // TODO: Should this protection really be here? It seems like it might make more sense to
        // do this check in the DeclarationReflection serializer... if it should even be checked. In the
        // old `.toObject` code, it wasn't checked.

        if (this.visited.has(reference.declaration)) {
            // if we're here it means that the reference type is rendered for the 2nd time
            // by the declaration it is referencing, we will render a pointer-only declaration.
            result.declaration = { id: reference.declaration.id };
        } else {
            // mark this declaration to trap a loop
            this.visited.add(reference.declaration);

            // objectify the declaration
            result.declaration = this.owner.toObject(reference.declaration);
        }

        // no more declaration rendering, remove marker.
        this.visited.delete(reference.declaration);

        return result;
    }
}
