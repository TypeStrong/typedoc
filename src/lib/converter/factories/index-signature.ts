import assert from "assert";
import ts from "typescript";
import {
    DeclarationReflection,
    ParameterReflection,
    ReflectionKind,
    SignatureReflection,
} from "../../models";
import type { Context } from "../context";
import { ConverterEvents } from "../converter-events";

export function convertIndexSignatures(context: Context, symbol: ts.Symbol) {
    assert(context.scope instanceof DeclarationReflection);

    const indexSymbol = symbol.members?.get("__index" as ts.__String);
    if (!indexSymbol) return;

    for (const indexDeclaration of indexSymbol.getDeclarations() || []) {
        assert(ts.isIndexSignatureDeclaration(indexDeclaration));
        const param = indexDeclaration.parameters[0] as
            | ts.ParameterDeclaration
            | undefined;
        assert(param && ts.isParameter(param));
        const index = new SignatureReflection(
            "__index",
            ReflectionKind.IndexSignature,
            context.scope,
        );
        index.comment = context.getNodeComment(indexDeclaration, false);
        index.parameters = [
            new ParameterReflection(
                param.name.getText(),
                ReflectionKind.Parameter,
                index,
            ),
        ];
        index.parameters[0].type = context.converter.convertType(
            context.withScope(index.parameters[0]),
            param.type,
        );
        index.type = context.converter.convertType(
            context.withScope(index),
            indexDeclaration.type,
        );
        context.registerReflection(index, indexSymbol);
        context.scope.indexSignatures ||= [];
        context.scope.indexSignatures.push(index);

        context.converter.trigger(
            ConverterEvents.CREATE_SIGNATURE,
            context,
            index,
            indexDeclaration,
        );
    }
}
