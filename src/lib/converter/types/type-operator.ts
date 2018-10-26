import * as ts from 'typescript';

import { TypeOperatorType } from '../../models/types/index';
import { Component, ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:type-operator'})
export class TypeOperatorConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.TypeOperatorNode> {
    /**
     * we want to run before union
     */
    priority = 50;

    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.TypeOperatorNode, type: ts.Type): boolean {
        return !!(node.kind === ts.SyntaxKind.TypeOperator);
    }

    /**
     * Interpret the given type operator node and convert it into a type representing keys of a type
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The type operator node representing keys of a type.
     * @returns The type representing keys of a type.
     */
    convertNode(context: Context, node: ts.TypeOperatorNode): TypeOperatorType | undefined {
        const target = this.owner.convertType(context, node.type);
        if (target) {
            return new TypeOperatorType(target);
        }
    }
}
