import * as ts from "typescript";

import {Type, UnknownType} from "../../models/types/index";
import {Component, ConverterTypeComponent, ITypeTypeConverter} from "../components";
import {Context} from "../context";


@Component({name:'type:unknown'})
export class UnknownConverter extends ConverterTypeComponent implements ITypeTypeConverter<ts.Type>
{
    /**
     * The priority this converter should be executed with.
     * A higher priority means the converter will be applied earlier.
     */
    priority:number = -100;



    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context:Context, type:ts.Type):boolean {
        return true;
    }


    /**
     * Convert the given type to its type reflection.
     *
     * This is a type based converter with no node based equivalent.
     *
     * If no other converter is able to reflect a type, this converter will produce a
     * reflection by utilising ts.typeToString() to generate a string representation of the
     * given type.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The type that should be converted.
     * @returns The type reflection representing the given type.
     */
    convertType(context:Context, type:ts.Type):Type {
        var name = context.checker.typeToString(type);
        return new UnknownType(name);
    }
}
