import * as ts from 'typescript';

import { Type } from '../../models/index';
import {
    Component,
    ConverterTypeComponent,
    TypeNodeConverter
} from '../components';
import { Context } from '../context';

@Component({ name: 'type:parens' })
export class ParensConverter
    extends ConverterTypeComponent
    implements TypeNodeConverter<ts.Type, ts.ParenthesizedTypeNode> {
    supportsNode(_context: Context, node: ts.TypeNode): boolean {
        return ts.isParenthesizedTypeNode(node);
    }

    convertNode(
        context: Context,
        node: ts.ParenthesizedTypeNode
    ): Type | undefined {
        return this.owner.convertType(context, node.type);
    }
}
