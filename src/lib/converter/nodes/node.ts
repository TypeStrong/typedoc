import * as ts from 'typescript';
import {Context} from '../context';
import {Converter} from '../converter';
import {Reflection} from '../../models/reflections/abstract';

export interface NodeConverterConstructor {
    supports: ts.SyntaxKind[];

    new (converter: Converter): NodeConverter;
}

export abstract class NodeConverter {
    static supports: ts.SyntaxKind[];

    protected converter: Converter;

    constructor(converter: Converter) {
        this.converter = converter;
    }

    abstract convert(context: Context, node: ts.Node): Reflection;
}
