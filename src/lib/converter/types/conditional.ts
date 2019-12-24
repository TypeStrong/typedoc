import * as ts from 'typescript';

import { ConditionalType, Type } from '../../models/types';
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
    convertNode(context: Context, node: ts.ConditionalTypeNode): ConditionalType | undefined {
        const types = this.owner.convertTypes(context, [node.checkType, node.extendsType, node.trueType, node.falseType]);
        if (types.length !== 4) {
            return undefined;
        }
        return new ConditionalType(...types as [Type, Type, Type, Type]);
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
    convertType(context: Context, type: ts.ConditionalType): ConditionalType | undefined {
        const types = this.owner.convertTypes(context, [], [type.checkType, type.extendsType, type.resolvedTrueType, type.resolvedFalseType]);
        if (types.length !== 4) {
            return undefined;
        }
        return new ConditionalType(...types as [Type, Type, Type, Type]);
    }
}
