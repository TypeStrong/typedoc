import {
    ContainerReflection,
    DeclarationReflection,
    makeRecursiveVisitor,
    ParameterReflection,
    type ProjectReflection,
    type ReferenceType,
    Reflection,
    SignatureReflection,
    TypeParameterReflection,
} from "../models";

export function discoverAllReferenceTypes(
    project: ProjectReflection,
    forExportValidation: boolean,
): { type: ReferenceType; owner: Reflection }[] {
    let current: Reflection | undefined = project;
    const queue: Reflection[] = [];
    const result: { type: ReferenceType; owner: Reflection }[] = [];

    const visitor = makeRecursiveVisitor({
        reference(type) {
            result.push({ type, owner: current! });
        },
        reflection(type) {
            queue.push(type.declaration);
        },
    });

    const add = (item: Reflection | Reflection[] | undefined) => {
        if (!item) return;

        if (item instanceof Reflection) {
            queue.push(item);
        } else {
            queue.push(...item);
        }
    };

    do {
        if (current instanceof ContainerReflection) {
            add(current.children);
        }

        if (current instanceof DeclarationReflection) {
            current.type?.visit(visitor);
            add(current.typeParameters);
            add(current.signatures);
            add(current.indexSignatures);
            add(current.getSignature);
            add(current.setSignature);
            current.overwrites?.visit(visitor);
            current.implementedTypes?.forEach((type) => type.visit(visitor));
            if (!forExportValidation) {
                current.inheritedFrom?.visit(visitor);
                current.implementationOf?.visit(visitor);
                current.extendedTypes?.forEach((t) => t.visit(visitor));
                current.extendedBy?.forEach((t) => t.visit(visitor));
                current.implementedBy?.forEach((t) => t.visit(visitor));
            }
        }

        if (current instanceof SignatureReflection) {
            add(current.parameters);
            add(current.typeParameters);
            current.type?.visit(visitor);
            current.overwrites?.visit(visitor);
            if (!forExportValidation) {
                current.inheritedFrom?.visit(visitor);
                current.implementationOf?.visit(visitor);
            }
        }

        if (current instanceof ParameterReflection) {
            current.type?.visit(visitor);
        }

        if (current instanceof TypeParameterReflection) {
            current.type?.visit(visitor);
            current.default?.visit(visitor);
        }
    } while ((current = queue.shift()));

    return result;
}
