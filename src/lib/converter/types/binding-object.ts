import * as ts from 'typescript';

import {Type, ReflectionKind, DeclarationReflection, ReflectionType} from '../../models/index';
import {TypeConverter, NodeTypeConverter} from './type';
import {Context} from '../context';
import {Converter} from '../converter';

export class BindingObjectConverter extends TypeConverter implements NodeTypeConverter {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.BindingPattern): boolean {
        return node.kind === ts.SyntaxKind.ObjectBindingPattern;
    }

    /**
     * Convert the given binding pattern to its type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The binding pattern that should be converted.
     * @returns The type reflection representing the given binding pattern.
     */
    convertNode(context: Context, node: ts.BindingPattern): Type {
        const declaration = new DeclarationReflection();
        declaration.kind = ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;

        context.registerReflection(declaration, null);
        context.trigger(Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, () => {
            (node.elements as ts.BindingElement[]).forEach((element) => {
                this.converter.convertNode(context, element);
            });
        });

        return new ReflectionType(declaration);
    }
}
