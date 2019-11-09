import * as ts from 'typescript';

import { PredicateType } from '../../models/types/index';
import { Component, ConverterTypeComponent } from '../components';
import { Context } from '../context';

@Component({ name: 'type:predicate' })
export class PredicateConverter extends ConverterTypeComponent {
    /**
     * This must run before the base `Type` converter.
     */
    priority = 50;

    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(_context: Context, node: ts.Node): boolean {
        return ts.isTypePredicateNode(node);
    }

    /**
     * Convert the given predicate type node to its type reflection.
     */
    convertNode(context: Context, node: ts.TypePredicateNode): PredicateType {
        const name = ts.isThisTypeNode(node.parameterName) ? 'this' : node.parameterName.getText();
        const asserts = !!node.assertsModifier;
        const targetType = this.owner.convertType(context, node.type);
        return new PredicateType(name, asserts, targetType);
    }
}
