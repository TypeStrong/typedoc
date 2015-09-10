import * as ts from "typescript";

import {Reflection} from "../models/reflections/abstract";
import {Context} from "./context";


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
function loadConverters(converterClasses:{}) {
    converters = {};

    for (var converterName in converterClasses) {
        var converterClass = converterClasses[converterName];
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
loadConverters(require('./nodes/index'));
