import * as ts from "typescript";

import {ReferenceType} from "../../models/index";
import {Component, ConverterTypeComponent, ITypeNodeConverter} from "../components";
import {Context} from "../context";


@Component({name:'type:alias'})
export class AliasConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.Type, ts.TypeReferenceNode>
{
    /**
     * The priority this converter should be executed with.
     * A higher priority means the converter will be applied earlier.
     */
    priority:number = 100;



    /**
     * Test whether the given node and type definitions represent a type alias.
     *
     * The compiler resolves type aliases pretty early and there is no field telling us
     * whether the given node was a type alias or not. So we have to compare the type name of the
     * node with the type name of the type symbol.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The node that should be tested.
     * @param type  The type of the node that should be tested.
     * @returns TRUE when the given node and type look like a type alias, otherwise FALSE.
     */
    supportsNode(context:Context, node:ts.TypeReferenceNode, type:ts.Type):boolean {
        if (!type || !node || !node.typeName) return false;
        if (!type.symbol) return true;

        var checker = context.checker;
        var symbolName = checker.getFullyQualifiedName(type.symbol).split('.');
        if (!symbolName.length) return false;
        if (symbolName[0].substr(0, 1) == '"') symbolName.shift();

        var nodeName = ts.getTextOfNode(node.typeName).split('.');
        if (!nodeName.length) return false;

        var common = Math.min(symbolName.length, nodeName.length);
        symbolName = symbolName.slice(-common);
        nodeName = nodeName.slice(-common);

        return nodeName.join('.') != symbolName.join('.');
    }


    /**
     * Create a reflection for the given type alias node.
     *
     * This is a node based converter with no type equivalent.
     *
     * Use [[isTypeAlias]] beforehand to test whether a given type/node combination is
     * pointing to a type alias.
     *
     * ```
     * type MyNumber = number;
     * var someValue:MyNumber;
     * ```
     *
     * @param node  The node whose type should be reflected.
     * @returns  A type reference pointing to the type alias definition.
     */
    convertNode(context:Context, node:ts.TypeReferenceNode):ReferenceType {
        var name = ts.getTextOfNode(node.typeName);
        return new ReferenceType(name, ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
    }
}
