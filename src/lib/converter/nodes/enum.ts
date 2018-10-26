import * as ts from 'typescript';

import { Reflection, ReflectionKind } from '../../models/index';
import { createDeclaration } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';
import { convertDefaultValue } from '../index';

@Component({name: 'node:enum'})
export class EnumConverter extends ConverterNodeComponent<ts.EnumDeclaration> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.EnumDeclaration
    ];

    /**
     * Analyze the given enumeration declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The enumeration declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.EnumDeclaration): Reflection | undefined {
        const enumeration = createDeclaration(context, node, ReflectionKind.Enum);

        context.withScope(enumeration, () => {
            if (node.members) {
                for (let member of node.members) {
                    this.convertMember(context, member);
                }
            }
        });

        return enumeration;
    }

    /**
     * Analyze the given enumeration member node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The enumeration member node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    private convertMember(context: Context, node: ts.EnumMember): Reflection | undefined {
        const member = createDeclaration(context, node, ReflectionKind.EnumMember);
        if (member) {
            member.defaultValue = convertDefaultValue(node);
        }

        return member;
    }
}
