import * as ts from 'typescript';

import { Reflection } from '../../models/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';

@Component({name: 'node:variable-statement'})
export class VariableStatementConverter extends ConverterNodeComponent<ts.VariableStatement> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.VariableStatement
    ];

    /**
     * Analyze the given variable statement node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The variable statement node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.VariableStatement): Reflection {
        if (node.declarationList && node.declarationList.declarations) {
            node.declarationList.declarations.forEach((variableDeclaration) => {
                if (ts.isArrayBindingPattern(variableDeclaration.name) || ts.isObjectBindingPattern(variableDeclaration.name)) {
                    this.convertBindingPattern(context, variableDeclaration.name);
                } else {
                    this.owner.convertNode(context, variableDeclaration);
                }
            });
        }

        return context.scope;
    }

    /**
     * Traverse the elements of the given binding pattern and create the corresponding variable reflections.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The binding pattern node that should be analyzed.
     */
    convertBindingPattern(context: Context, node: ts.BindingPattern) {
        node.elements.forEach((element) => {
            this.owner.convertNode(context, element);

            if (!ts.isBindingElement(element)) {
                return;
            }

            if (ts.isArrayBindingPattern(element.name) || ts.isObjectBindingPattern(element.name)) {
                this.convertBindingPattern(context, element.name);
            }
        });
    }
}
