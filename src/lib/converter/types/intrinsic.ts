import * as ts from 'typescript';

import {IntrinsicType} from '../../models/index';
import {TypeConverter, TypeTypeConverter} from './type';
import {Context} from '../context';

// TypeScript has an @internal enum set for the intrinsic types:
// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L2297-L2298
// It is not included in the typescript typings, so the enum is cast as `any` to access the `Intrinsic` set.
// tslint:disable-next-line:variable-name
const IntrinsicTypeFlags = (ts.TypeFlags as any).Intrinsic;
if (IntrinsicTypeFlags === undefined) {
    throw new Error('Internal TypeScript API missing: TypeFlags.Intrinsic');
}

export class IntrinsicConverter extends TypeConverter implements TypeTypeConverter {
    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.Type): boolean {
        return !!(type.flags & IntrinsicTypeFlags);
    }

    /**
     * Convert the given intrinsic type to its type reflection.
     *
     * This is a type based converter with no node based equivalent.
     *
     * ```
     * let someValue: string;
     * ```
     *
     * @param type  The intrinsic type that should be converted.
     * @returns The type reflection representing the given intrinsic type.
     */
    convertType(context: Context, type: ts.Type): IntrinsicType {
        let intrinsicName = context.program.getTypeChecker().typeToString(type);
        return new IntrinsicType(intrinsicName);
    }
}
