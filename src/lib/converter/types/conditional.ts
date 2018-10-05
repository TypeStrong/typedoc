import * as ts from 'typescript';

import { ConditionalType } from '../../models/types';
import { Component, ConverterTypeComponent, TypeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:conditional'})
export class ConditionalConverter extends ConverterTypeComponent implements TypeConverter<ts.ConditionalType, ts.ConditionalTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.ConditionalTypeNode): boolean {
        return node.kind === ts.SyntaxKind.ConditionalType;
    }

    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.ConditionalType): boolean {
        return !!(type.flags & ts.TypeFlags.Conditional);
    }

    /**
     * Convert the given conditional type node to its type reflection.
     *
     * This is a node based converter, see [[convertType]] for the type equivalent.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The conditional or intersection type node that should be converted.
     * @returns The type reflection representing the given conditional type node.
     */
    convertNode(context: Context, node: ts.ConditionalTypeNode): ConditionalType {
        return new ConditionalType(
            this.owner.convertType(context, node.checkType),
            this.owner.convertType(context, node.extendsType),
            this.owner.convertType(context, node.trueType),
            this.owner.convertType(context, node.falseType)
        );
    }

    /**
     * Convert the given conditional type to its type reflection.
     *
     * This is a type based converter, see [[convertNode]] for the node equivalent.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The conditional type that should be converted.
     * @returns The type reflection representing the given conditional type.
     */
    convertType(context: Context, type: ts.ConditionalType): ConditionalType {
        return new ConditionalType(
            this.owner.convertType(context, null, type.checkType),
            this.owner.convertType(context, null, type.extendsType),
            this.owner.convertType(context, null, type.resolvedTrueType),
            this.owner.convertType(context, null, type.resolvedFalseType)
        );
    }
}
