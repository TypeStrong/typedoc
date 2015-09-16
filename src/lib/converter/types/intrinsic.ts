import * as ts from "typescript";

import {Type, IntrinsicType} from "../../models/index";
import {Component, ConverterTypeComponent, ITypeTypeConverter} from "../components";
import {Context} from "../context";


@Component({name:'type:intrinsic'})
export class IntrinsicConverter extends ConverterTypeComponent implements ITypeTypeConverter<ts.IntrinsicType>
{
    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context:Context, type:ts.IntrinsicType):boolean {
        return !!(type.flags & ts.TypeFlags.Intrinsic);
    }


    /**
     * Convert the given intrinsic type to its type reflection.
     *
     * This is a type based converter with no node based equivalent.
     *
     * ```
     * var someValue:string;
     * ```
     *
     * @param type  The intrinsic type that should be converted.
     * @returns The type reflection representing the given intrinsic type.
     */
    convertType(context:Context, type:ts.IntrinsicType):IntrinsicType {
        return new IntrinsicType(type.intrinsicName);
    }
}
