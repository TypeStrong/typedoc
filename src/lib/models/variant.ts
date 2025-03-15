import type { DeclarationReflection } from "./DeclarationReflection.js";
import type { DocumentReflection } from "./DocumentReflection.js";
import type { ParameterReflection } from "./ParameterReflection.js";
import type { ProjectReflection } from "./ProjectReflection.js";
import type { ReferenceReflection } from "./ReferenceReflection.js";
import type { SignatureReflection } from "./SignatureReflection.js";
import type { TypeParameterReflection } from "./TypeParameterReflection.js";

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

export type SomeReflection = ReflectionVariant[keyof ReflectionVariant];
