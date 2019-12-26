import * as ts from 'typescript';

import { Type, IndexedAccessType } from '../../models/index';
import {
    Component,
    ConverterTypeComponent,
    TypeNodeConverter
} from '../components';
import { Context } from '../context';

@Component({ name: 'type:indexed-access' })
export class IndexedAccessConverter extends ConverterTypeComponent
    implements TypeNodeConverter<ts.Type, ts.IndexedAccessTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.TypeNode) {
        return ts.isIndexedAccessTypeNode(node);
    }

    convertNode(context: Context, node: ts.IndexedAccessTypeNode): Type | undefined {
        const objectType = this.owner.convertType(context, node.objectType);
        if (!objectType) { return; }
        const indexType = this.owner.convertType(context, node.indexType);
        if (!indexType) { return; }
        return new IndexedAccessType(objectType, indexType);
    }
}
