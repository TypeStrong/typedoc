import * as ts from "typescript";

import {Reflection, ReflectionKind, IntrinsicType} from "../../models/index";
import {createDeclaration, createComment} from "../factories/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";
import {convertDefaultValue} from "../index";


@Component({name:'node:variable'})
export class VariableConverter extends ConverterNodeComponent<ts.VariableDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.PropertySignature,
        ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.PropertyAssignment,
        ts.SyntaxKind.ShorthandPropertyAssignment,
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.BindingElement
    ];


    isSimpleObjectLiteral(objectLiteral:ts.ObjectLiteralExpression):boolean {
        if (!objectLiteral.properties) return true;
        return objectLiteral.properties.length == 0;
    }


    /**
     * Analyze the given variable declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The variable declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.VariableDeclaration):Reflection {
        var comment = createComment(node);
        if (comment && comment.hasTag("resolve")) {
            var resolveType = context.getTypeAtLocation(node);
            if (resolveType && resolveType.symbol) {
                var resolved = this.owner.convertNode(context, resolveType.symbol.declarations[0]);
                if (resolved) {
                    resolved.name = node.symbol.name;
                }
                return resolved;
            }
        }

        var name:string, isBindingPattern:boolean;
        if (ts.isBindingPattern(node.name)) {
            if (node['propertyName']) {
                name = ts.declarationNameToString(node['propertyName']);
                isBindingPattern = true;
            } else {
                return null;
            }
        }

        var scope = context.scope;
        var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Property : ReflectionKind.Variable;
        var variable = createDeclaration(context, node, kind, name);
        context.withScope(variable, () => {
            if (node.initializer) {
                switch (node.initializer.kind) {
                    case ts.SyntaxKind.ArrowFunction:
                    case ts.SyntaxKind.FunctionExpression:
                        variable.kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                        this.owner.convertNode(context, node.initializer);
                        break;
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        if (!this.isSimpleObjectLiteral(<ts.ObjectLiteralExpression>node.initializer)) {
                            variable.kind = ReflectionKind.ObjectLiteral;
                            variable.type = new IntrinsicType('object');
                            this.owner.convertNode(context, node.initializer);
                        }
                        break;
                    default:
                        variable.defaultValue = convertDefaultValue(node);
                }
            }

            if (variable.kind == kind || variable.kind == ReflectionKind.Event) {
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
