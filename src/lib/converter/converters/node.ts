import * as ts from "typescript";

import {Context} from "../Context";
import {Reflection} from "../../models/Reflection";
import * as nodes from './nodes/index';


export interface NodeConveter<T extends ts.Node>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[];


    convert(context:Context, node:T):Reflection;
}


var converters:{[syntaxKind:number]:NodeConveter<ts.Node>};


/**
 * Instantiates all type converters.
 */
function loadConverters()
{
    converters = {};

    for (var nodeName in nodes) {
        var converterClass = nodes[nodeName];
        var converter:NodeConveter<ts.Node> = new converterClass();

        for (var supports of converter.supports) {
            converters[supports] = converter;
        }
    }
}


/**
 * Analyze the given node and create a suitable reflection.
 *
 * This function checks the kind of the node and delegates to the matching function implementation.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node     The compiler node that should be analyzed.
 * @return The resulting reflection or NULL.
 */
export function convertNode(context:Context, node:ts.Node):Reflection {
    if (context.visitStack.indexOf(node) != -1) {
        return null;
    }

    var oldVisitStack = context.visitStack;
    context.visitStack = oldVisitStack.slice();
    context.visitStack.push(node);

    if (context.getOptions().verbose) {
        var file = ts.getSourceFileOfNode(node);
        var pos = ts.getLineAndCharacterOfPosition(file, node.pos);
        if (node.symbol) {
            context.getLogger().verbose(
                'Visiting \x1b[34m%s\x1b[0m\n    in %s (%s:%s)',
                context.checker.getFullyQualifiedName(node.symbol),
                file.fileName, pos.line.toString(), pos.character.toString()
            );
        } else {
            context.getLogger().verbose(
                'Visiting node of kind %s in %s (%s:%s)',
                node.kind.toString(),
                file.fileName, pos.line.toString(), pos.character.toString()
            );
        }
    }

    var result:Reflection;
    if (node.kind in converters) {
        result = converters[node.kind].convert(context, node);
    }

    context.visitStack = oldVisitStack;
    return result;
}


/**
 * Instantiate the type converters.
 */
loadConverters();



/*
export function visit(context:Context, node:ts.Node):Reflection {
    if (context.visitStack.indexOf(node) != -1) {
        return null;
    }

    var oldVisitStack = context.visitStack;
    context.visitStack = oldVisitStack.slice();
    context.visitStack.push(node);

    if (context.getOptions().verbose) {
        var file = ts.getSourceFileOfNode(node);
        var pos = ts.getLineAndCharacterOfPosition(file, node.pos);
        if (node.symbol) {
            context.getLogger().verbose(
                'Visiting \x1b[34m%s\x1b[0m\n    in %s (%s:%s)',
                context.checker.getFullyQualifiedName(node.symbol),
                file.fileName, pos.line.toString(), pos.character.toString()
            );
        } else {
            context.getLogger().verbose(
                'Visiting node of kind %s in %s (%s:%s)',
                node.kind.toString(),
                file.fileName, pos.line.toString(), pos.character.toString()
            );
        }
    }

    var result:Reflection;
    switch (node.kind) {
        case ts.SyntaxKind.SourceFile:
            result = visitSourceFile(context, <ts.SourceFile>node);
            break;

        case ts.SyntaxKind.ClassExpression:
        case ts.SyntaxKind.ClassDeclaration:
            result = visitClassDeclaration(context, <ts.ClassDeclaration>node);
            break;

        case ts.SyntaxKind.InterfaceDeclaration:
            result = visitInterfaceDeclaration(context, <ts.InterfaceDeclaration>node);
            break;

        case ts.SyntaxKind.ModuleDeclaration:
            result = visitModuleDeclaration(context, <ts.ModuleDeclaration>node);
            break;

        case ts.SyntaxKind.VariableStatement:
            result = visitVariableStatement(context, <ts.VariableStatement>node);
            break;

        case ts.SyntaxKind.PropertySignature:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.PropertyAssignment:
        case ts.SyntaxKind.ShorthandPropertyAssignment:
        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.BindingElement:
            result = visitVariableDeclaration(context, <ts.VariableDeclaration>node);
            break;

        case ts.SyntaxKind.EnumDeclaration:
            result = visitEnumDeclaration(context, <ts.EnumDeclaration>node);
            break;

        case ts.SyntaxKind.EnumMember:
            result = visitEnumMember(context, <ts.EnumMember>node);
            break;

        case ts.SyntaxKind.Constructor:
        case ts.SyntaxKind.ConstructSignature:
            result = visitConstructor(context, <ts.ConstructorDeclaration>node);
            break;

        case ts.SyntaxKind.MethodSignature:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
            result = visitFunctionDeclaration(context, <ts.MethodDeclaration>node);
            break;

        case ts.SyntaxKind.GetAccessor:
            result = visitGetAccessorDeclaration(context, <ts.SignatureDeclaration>node);
            break;

        case ts.SyntaxKind.SetAccessor:
            result = visitSetAccessorDeclaration(context, <ts.SignatureDeclaration>node);
            break;

        case ts.SyntaxKind.CallSignature:
        case ts.SyntaxKind.FunctionType:
            result = visitCallSignatureDeclaration(context, <ts.SignatureDeclaration>node);
            break;

        case ts.SyntaxKind.IndexSignature:
            result = visitIndexSignatureDeclaration(context, <ts.SignatureDeclaration>node);
            break;

        case ts.SyntaxKind.Block:
        case ts.SyntaxKind.ModuleBlock:
            result = visitBlock(context, <ts.Block>node);
            break;

        case ts.SyntaxKind.ObjectLiteralExpression:
            result = visitObjectLiteral(context, <ts.ObjectLiteralExpression>node);
            break;

        case ts.SyntaxKind.TypeLiteral:
            result = visitTypeLiteral(context, <ts.TypeLiteralNode>node);
            break;

        case ts.SyntaxKind.ExportAssignment:
            result = visitExportAssignment(context, <ts.ExportAssignment>node);
            break;

        case ts.SyntaxKind.TypeAliasDeclaration:
            result = visitTypeAliasDeclaration(context, <ts.TypeAliasDeclaration>node);
            break;
    }

    context.visitStack = oldVisitStack;
    return result;
}
*/
