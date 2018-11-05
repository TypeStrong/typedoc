import * as ts from 'typescript';

import { Type } from '../../models/index';
import { createReferenceType } from '../factories/index';
import { Component, ConverterTypeComponent, TypeTypeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:enum'})
export class EnumConverter extends ConverterTypeComponent implements TypeTypeConverter<ts.Type> {
    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.Type): boolean {
        return !!(type.flags & ts.TypeFlags.EnumLike);
    }

    /**
     * Convert the given enumeration type to its type reflection.
     *
     * This is a type based converter with no node based equivalent.
     *
     * ```
     * enum MyEnum { One, Two, Three }
     * let someValue: MyEnum;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The enumeration type that should be converted.
     * @returns The type reflection representing the given enumeration type.
     */
    convertType(context: Context, type: ts.Type): Type | undefined {
        return createReferenceType(context, type.symbol);
    }
}
