import type { DeclarationReflection } from "./declaration";
import type { DocumentReflection } from "./document";
import type { ParameterReflection } from "./parameter";
import type { ProjectReflection } from "./project";
import type { ReferenceReflection } from "./reference";
import type { SignatureReflection } from "./signature";
import type { TypeParameterReflection } from "./type-parameter";

/**
 * A map of known {@link Reflection} concrete subclasses.
 * This is used during deserialization to reconstruct serialized objects.
 */
export interface ReflectionVariant {
    declaration: DeclarationReflection;
    param: ParameterReflection;
    project: ProjectReflection;
    reference: ReferenceReflection;
    signature: SignatureReflection;
    typeParam: TypeParameterReflection;
    document: DocumentReflection;
}
