import * as ts from 'typescript';

import { ReferenceType } from '../../models/index';
import { Component, ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:alias'})
export class AliasConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.TypeReferenceNode> {
    /**
     * The priority this converter should be executed with.
     * A higher priority means the converter will be applied earlier.
     */
    priority = 100;

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
    supportsNode(context: Context, node: ts.TypeReferenceNode, type: ts.Type): boolean {
        if (!type || !node || !node.typeName) {
            return false;
        }
        if (!type.symbol) {
            return true;
        }

        const checker = context.checker;
        const fqn = checker.getFullyQualifiedName(type.symbol);

        let symbolName = fqn.replace(/".*"\./, '').split('.');
        if (!symbolName.length) {
            return false;
        }

        let nodeName = node.typeName.getText().split('.');
        if (!nodeName.length) {
            return false;
        }

        let common = Math.min(symbolName.length, nodeName.length);
        symbolName = symbolName.slice(-common);
        nodeName = nodeName.slice(-common);

        return nodeName.join('.') !== symbolName.join('.');
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
     * let someValue: MyNumber;
     * ```
     *
     * @param node  The node whose type should be reflected.
     * @returns  A type reference pointing to the type alias definition.
     */
    convertNode(context: Context, node: ts.TypeReferenceNode): ReferenceType {
        const name = node.typeName.getText();
        const result = new ReferenceType(name, ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);

        if (node.typeArguments) {
            result.typeArguments = this.owner.convertTypes(context, node.typeArguments);
        }

        return result;
    }
}
