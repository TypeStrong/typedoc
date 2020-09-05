import * as ts from 'typescript';

import { Type, TupleType } from '../../models/types/index';
import { Component, ConverterTypeComponent, TypeConverter, TypeNodeConverter } from '../components';
import { Context } from '../context';
import { NamedTupleMember } from '../../models/types/tuple';

@Component({name: 'type:tuple'})
export class TupleConverter extends ConverterTypeComponent implements TypeConverter<ts.TypeReference, ts.TupleTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(_context: Context, node: ts.TupleTypeNode): boolean {
        return node.kind === ts.SyntaxKind.TupleType;
    }

    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.TypeReference): boolean {
        // If this type is a tuple
        if (type.objectFlags & ts.ObjectFlags.Tuple) {
            return true;
        }

        // If this type points to a tuple
        if (type.objectFlags & ts.ObjectFlags.Reference) {
            if (type.target.objectFlags & ts.ObjectFlags.Tuple) {
                return true;
            }
        }

        return false;
    }

    /**
     * Convert the given tuple type node to its type reflection.
     *
     * This is a node based converter, see [[convertTupleType]] for the type equivalent.
     *
     * ```
     * let someValue: [string,number];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The tuple type node that should be converted.
     * @returns The type reflection representing the given tuple type node.
     */
    convertNode(context: Context, node: ts.TupleTypeNode): TupleType {
        // TS 3.9 support
        const elementTypes = node.elements ?? (node as any).elementTypes;
        const elements: Type[] = this.owner.convertTypes(context, elementTypes);
        return new TupleType(elements);
    }

    /**
     * Convert the given tuple type to its type reflection.
     *
     * This is a type based converter, see [[convertTupleTypeNode]] for the node equivalent.
     *
     * ```
     * let someValue: [string,number];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The tuple type that should be converted.
     * @returns The type reflection representing the given tuple type.
     */
    convertType(context: Context, type: ts.TypeReference): TupleType {
        // TODO: We might be able to have named tuple elements here.
        const elements: Type[] = this.owner.convertTypes(context, undefined, type.typeArguments);
        return new TupleType(elements);
    }
}

@Component({ name: 'type:named-tuple-member' })
export class NamedTupleMemberConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.NamedTupleMember> {
    supportsNode(_context: Context, node: ts.Node) {
        // TS 3.9 support
        return ts.isNamedTupleMember && ts.isNamedTupleMember(node);
    }

    convertNode(context: Context, node: ts.NamedTupleMember): NamedTupleMember | undefined {
        const innerType = this.owner.convertType(context, node.type);
        if (!innerType) {
            return;
        }

        return new NamedTupleMember(node.name.getText(), !!node.questionToken, innerType);
    }
}
