import * as ts from 'typescript';

import {Type} from '../../models/types/abstract';
import {Context} from '../context';
import {Converter} from '../converter';

export type TypeConverterConstructor = new (converter: Converter) => TypeConverter;

export abstract class TypeConverter {
    /**
     * The priority this converter should be executed with.
     * A higher priority means the converter will be applied earlier.
     */
    priority = 0;

    protected converter: Converter;

    constructor(converter: Converter) {
        this.converter = converter;
    }
}

export interface NodeTypeConverter extends TypeConverter {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.Node, type: ts.Type): boolean;

    /**
     * Convert the given type node to its type reflection.
     */
    convertNode(context: Context, node: ts.Node, type: ts.Type): Type;
}

export function isNodeTypeConverter(object: any): object is NodeTypeConverter {
    return object instanceof TypeConverter && ('supportsNode' in object) &&
        ('convertNode' in object);
}

export interface TypeTypeConverter extends TypeConverter {
    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.Type): boolean;

    /**
     * Convert the given type to its type reflection.
     */
    convertType(context: Context, type: ts.Type): Type;
}

export function isTypeTypeConverter(object: any): object is TypeTypeConverter {
    return object instanceof TypeConverter && ('supportsType' in object) &&
        ('convertType' in object);
}
