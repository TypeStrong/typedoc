import * as ts from 'typescript';
import * as _ts from '../../ts-internal';

import { Reflection, ReflectionFlag, ReflectionKind, IntrinsicType } from '../../models/index';
import { createDeclaration, createComment } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';
import { convertDefaultValue } from '../index';

@Component({name: 'node:variable'})
export class VariableConverter extends ConverterNodeComponent<ts.VariableDeclaration> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.PropertySignature,
        ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.PropertyAssignment,
        ts.SyntaxKind.ShorthandPropertyAssignment,
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.BindingElement
    ];

    isSimpleObjectLiteral(objectLiteral: ts.ObjectLiteralExpression): boolean {
        if (!objectLiteral.properties) {
            return true;
        }
        return objectLiteral.properties.length === 0;
    }

    /**
     * Analyze the given variable declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The variable declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.VariableDeclaration): Reflection {
        const comment = createComment(node);
        if (comment && comment.hasTag('resolve')) {
            const resolveType = context.getTypeAtLocation(node);
            if (resolveType && resolveType.symbol) {
                const resolved = this.owner.convertNode(context, resolveType.symbol.declarations[0]);
                if (resolved) {
                    resolved.name = node.symbol.name;
                }
                return resolved;
            }
        }

        let name: string, isBindingPattern: boolean;
        if (_ts.isBindingPattern(node.name)) {
            if (node['propertyName']) {
                name = _ts.declarationNameToString(node['propertyName']);
                isBindingPattern = true;
            } else {
                return null;
            }
        }

        const scope = context.scope;
        const kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Property : ReflectionKind.Variable;
        const variable = createDeclaration(context, node, kind, name);

        // The variable can be null if `excludeNotExported` is `true`
        if (variable) {
            switch (kind) {
                case ReflectionKind.Variable:
                    if (node.parent.flags & ts.NodeFlags.Const) {
                        variable.setFlag(ReflectionFlag.Const, true);
                    } else if (node.parent.flags & ts.NodeFlags.Let) {
                        variable.setFlag(ReflectionFlag.Let, true);
                    }
                    break;
                case ReflectionKind.Property:
                    if (node.modifiers
                        && node.modifiers.some( m => m.kind === ts.SyntaxKind.AbstractKeyword )) {
                    variable.setFlag(ReflectionFlag.Abstract, true);
                    }
                    break;
            }
        }

        context.withScope(variable, () => {
            if (node.initializer) {
                switch (node.initializer.kind) {
                    case ts.SyntaxKind.ArrowFunction:
                    case ts.SyntaxKind.FunctionExpression:
                        variable.kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                        this.owner.convertNode(context, node.initializer);
                        break;
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        if (!this.isSimpleObjectLiteral(<ts.ObjectLiteralExpression> node.initializer)) {
                            variable.kind = ReflectionKind.ObjectLiteral;
                            variable.type = new IntrinsicType('object');
                            this.owner.convertNode(context, node.initializer);
                        }
                        break;
                    default:
                        variable.defaultValue = convertDefaultValue(node);
                }
            }

            if (variable.kind === kind || variable.kind === ReflectionKind.Event) {
                if (isBindingPattern) {
                    variable.type = this.owner.convertType(context, node.name);
                } else {
                    variable.type = this.owner.convertType(context, node.type, context.getTypeAtLocation(node));
                }
            }
        });

        return variable;
    }
}
