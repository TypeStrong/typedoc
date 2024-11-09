import assert from "assert";
import type ts from "typescript";
import {
    DeclarationReflection,
    ParameterReflection,
    ReflectionFlag,
    ReflectionKind,
    SignatureReflection,
    UnionType,
} from "../../models/index.js";
import type { Context } from "../context.js";
import { ConverterEvents } from "../converter-events.js";

export function convertIndexSignatures(context: Context, type: ts.Type) {
    assert(context.scope instanceof DeclarationReflection);

    // Each declaration should have one SignatureReflection
    // If we don't have a declaration, the index signature was inferred by TS
    // and we should make a separate SignatureReflection for each index signature.
    const seenByDeclaration = new Map<ts.Declaration, SignatureReflection>();
    const createdSignatures: [
        ts.IndexSignatureDeclaration | undefined,
        SignatureReflection,
    ][] = [];

    for (const indexInfo of context.checker.getIndexInfosOfType(type)) {
        // Check if we've already created an index signature for this type
        if (
            indexInfo.declaration &&
            seenByDeclaration.has(indexInfo.declaration)
        ) {
            const createdSig = seenByDeclaration.get(indexInfo.declaration)!;
            if (createdSig.parameters![0].type?.type !== "union") {
                createdSig.parameters![0].type = new UnionType([
                    createdSig.parameters![0].type!,
                ]);
            }
            createdSig.parameters![0].type.types.push(
                context.converter.convertType(
                    context.withScope(createdSig),
                    indexInfo.keyType,
                ),
            );
            // No need to update the return type as it will be the same for all members.
            continue;
        }

        // Otherwise create a new one
        const index = new SignatureReflection(
            "__index",
            ReflectionKind.IndexSignature,
            context.scope,
        );
        if (indexInfo.isReadonly) {
            index.setFlag(ReflectionFlag.Readonly);
        }

        createdSignatures.push([indexInfo.declaration, index]);
        if (indexInfo.declaration) {
            seenByDeclaration.set(indexInfo.declaration, index);
            index.comment = context.getNodeComment(
                indexInfo.declaration,
                /* moduleComment */ false,
            );
        }

        index.parameters = [
            new ParameterReflection(
                indexInfo.declaration?.parameters[0].name.getText() ?? "key",
                ReflectionKind.Parameter,
                index,
            ),
        ];
        index.parameters[0].type = context.converter.convertType(
            context.withScope(index.parameters[0]),
            indexInfo.keyType,
        );
        index.type = context.converter.convertType(
            context.withScope(index),
            indexInfo.type,
        );

        context.registerReflection(index, indexInfo.declaration?.symbol);
        context.scope.indexSignatures ||= [];
        context.scope.indexSignatures.push(index);
    }

    // Now that we've created everything, trigger events for them.
    for (const [declaration, index] of createdSignatures) {
        context.converter.trigger(
            ConverterEvents.CREATE_SIGNATURE,
            context,
            index,
            declaration,
        );
    }
}
