
import * as ts from "typescript";

import {Context} from "../../Context";
import {Reflection, ReflectionKind} from "../../../models/Reflection";

import {NodeConveter} from "../node";
import {createDeclaration} from "../factories/declaration";
import {convertDefaultValue} from "../expression";


export class EnumConverter implements NodeConveter<ts.EnumDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.EnumDeclaration
    ];


    /**
     * Analyze the given enumeration declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The enumeration declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.EnumDeclaration):Reflection {
        var enumeration = createDeclaration(context, node, ReflectionKind.Enum);

        context.withScope(enumeration, () => {
            if (node.members) {
                for (var member of node.members) {
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
    private convertMember(context:Context, node:ts.EnumMember):Reflection {
        var member = createDeclaration(context, node, ReflectionKind.EnumMember);
        if (member) {
            member.defaultValue = convertDefaultValue(node);
        }

        return member;
    }
}
