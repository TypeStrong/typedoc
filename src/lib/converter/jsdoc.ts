// Converter functions for JSDoc defined types
// @typedef
// @callback
//
// TypeScript 7 reparses these tags into type alias declarations with regular
// type nodes. The tag is still needed for the comment, which is only part of
// the JSDoc comment that contains it.

import { ok } from "assert";
import * as ts from "../ts.js";
import { DeclarationReflection, ReflectionKind } from "#models";
import { getDeclarations } from "#node-utils";
import type { Context } from "./context.js";
import { convertConstructSignatures, createSignature, createTypeParamReflection } from "./factories/signature.js";
import { i18n } from "#utils";
import { convertIndexSignatures } from "./factories/index-signature.js";

// This is almost convertTypeAliasAsInterface, but unfortunately needs to be separate
// due to the comment coming from the JSDoc tag.
function convertJsDocAliasAsInterface(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol: ts.Symbol | undefined,
    declaration: ts.TypeAliasDeclaration,
    tag: ts.JSDocTypedefTag,
): undefined {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Interface,
        symbol,
        exportSymbol,
    );
    context.finalizeDeclarationReflection(reflection);
    const rc = context.withScope(reflection);

    const type = context.checker.getDeclaredTypeOfSymbol(symbol);

    if (type.flags & ts.TypeFlags.Union) {
        context.logger.warn(
            i18n.converting_union_as_interface(),
            tag,
        );
    }

    // Interfaces have properties
    for (const prop of type.getProperties()) {
        context.converter.convertSymbol(rc, prop);
    }

    // And type parameters
    convertTemplateParameters(rc, declaration);

    // And maybe call signatures
    context.checker
        .getSignaturesOfType(type, ts.SignatureKind.Call)
        .forEach((sig) => createSignature(rc, ReflectionKind.CallSignature, sig, symbol));

    // And maybe constructor signatures
    convertConstructSignatures(rc, symbol);

    // And finally, index signatures
    convertIndexSignatures(rc, type);
}

export function convertJsDocAlias(
    context: Context,
    symbol: ts.Symbol,
    declaration: ts.TypeAliasDeclaration,
    tag: ts.JSDocTypedefTag,
    exportSymbol?: ts.Symbol,
) {
    if (
        tag.typeExpression &&
        ts.isJSDocTypeLiteral(tag.typeExpression)
    ) {
        convertJsDocInterface(context, declaration, tag, symbol, exportSymbol);
        return;
    }

    const comment = context.getJsDocComment(tag);
    if (comment?.hasModifier("@interface")) {
        return convertJsDocAliasAsInterface(
            context,
            symbol,
            exportSymbol,
            declaration,
            tag,
        );
    }

    // If the typedef tag is just referring to another type-space symbol, with no type parameters
    // or appropriate forwarding type parameters, then we treat it as a re-export instead of creating
    // a type alias with an import type.
    const aliasedSymbol = getTypedefReExportTarget(context, declaration);
    if (aliasedSymbol) {
        context.converter.convertSymbol(
            context,
            aliasedSymbol,
            exportSymbol ?? symbol,
        );
        return;
    }

    const reflection = context.createDeclarationReflection(
        ReflectionKind.TypeAlias,
        symbol,
        exportSymbol,
    );
    reflection.comment = comment;

    reflection.type = context.converter.convertType(
        context.withScope(reflection),
        declaration.type,
    );

    convertTemplateParameters(
        context.withScope(reflection),
        declaration,
    );

    context.finalizeDeclarationReflection(reflection);
}

export function convertJsDocCallback(
    context: Context,
    symbol: ts.Symbol,
    declaration: ts.TypeAliasDeclaration,
    tag: ts.JSDocCallbackTag,
    exportSymbol?: ts.Symbol,
) {
    const alias = context.createDeclarationReflection(
        ReflectionKind.TypeAlias,
        symbol,
        exportSymbol,
    );
    alias.comment = context.getJsDocComment(tag);
    context.finalizeDeclarationReflection(alias);

    const ac = context.withScope(alias);

    // The callback is reparsed into a function type, which converts to a type
    // literal with a single call signature.
    alias.type = context.converter.convertType(ac, declaration.type);
    convertTemplateParameters(ac, declaration);
}

function convertJsDocInterface(
    context: Context,
    declaration: ts.TypeAliasDeclaration,
    tag: ts.JSDocTypedefTag,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Interface,
        symbol,
        exportSymbol,
    );
    reflection.comment = context.getJsDocComment(tag);
    context.finalizeDeclarationReflection(reflection);

    const rc = context.withScope(reflection);

    const type = context.checker.getDeclaredTypeOfSymbol(symbol);
    for (const s of type.getProperties()) {
        context.converter.convertSymbol(rc, s);
    }

    convertTemplateParameters(rc, declaration);
}

// @template tags are reparsed into the type parameters of the alias.
function convertTemplateParameters(context: Context, declaration: ts.TypeAliasDeclaration) {
    ok(context.scope instanceof DeclarationReflection);
    context.scope.typeParameters = declaration.typeParameters?.map((param) =>
        createTypeParamReflection(param, context)
    );
}

function getTypedefReExportTarget(
    context: Context,
    declaration: ts.TypeAliasDeclaration,
): ts.Symbol | undefined {
    const type = declaration.type;
    if (
        !type ||
        !ts.isImportTypeNode(type) ||
        !type.qualifier ||
        !ts.isIdentifier(type.qualifier)
    ) {
        return;
    }

    const targetSymbol = context.expectSymbolAtLocation(type.qualifier);
    const decl = getDeclarations(targetSymbol)[0];

    if (
        !decl ||
        !(
            ts.isTypeAliasDeclaration(decl) ||
            ts.isInterfaceDeclaration(decl)
        )
    ) {
        return;
    }

    const targetParams = decl.typeParameters ?? [];
    const localParams = declaration.typeParameters ?? [];
    const localArgs = type.typeArguments || [];

    // If we have type parameters, ensure they are forwarding parameters with no transformations.
    // This doesn't check constraints since they aren't checked in JSDoc types.
    if (
        targetParams.length !== localParams.length ||
        localArgs.some(
            (arg, i) =>
                !ts.isTypeReferenceNode(arg) ||
                !ts.isIdentifier(arg.typeName) ||
                arg.typeArguments ||
                localParams[i]?.name.text !== arg.typeName.text,
        )
    ) {
        return;
    }

    return targetSymbol;
}
