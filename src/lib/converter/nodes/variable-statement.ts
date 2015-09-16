import * as ts from "typescript";

import {Reflection, ReflectionKind} from "../../models/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:variable-statement'})
export class VariableStatementConverter extends ConverterNodeComponent<ts.VariableStatement>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.VariableStatement
    ];


    /**
     * Analyze the given variable statement node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The variable statement node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.VariableStatement):Reflection {
        if (node.declarationList && node.declarationList.declarations) {
            node.declarationList.declarations.forEach((variableDeclaration) => {
                if (ts.isBindingPattern(variableDeclaration.name)) {
                    this.convertBindingPattern(context, <ts.BindingPattern>variableDeclaration.name);
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
    convertBindingPattern(context:Context, node:ts.BindingPattern) {
        node.elements.forEach((element:ts.BindingElement) => {
            this.owner.convertNode(context, <any>element);

            if (ts.isBindingPattern(element.name)) {
                this.convertBindingPattern(context, <ts.BindingPattern>element.name);
            }
        });
    }
}
