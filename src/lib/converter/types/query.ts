import * as ts from 'typescript';

import { Type, QueryType } from '../../models/types/index';
import { Component, ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';
import { createReferenceType } from '../factories';

@Component({name: 'type:query'})
export class QueryConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.TypeQueryNode> {
    supportsNode(_context: Context, node: ts.Node): boolean {
        return ts.isTypeQueryNode(node);
    }

    convertNode(context: Context, node: ts.TypeQueryNode): Type | undefined {
        const querySymbol = context.getSymbolAtLocation(node.exprName);
        if (querySymbol) {
            const reference = createReferenceType(context, querySymbol);
            if (reference) {
                return new QueryType(reference);
            }
        }
    }

}
