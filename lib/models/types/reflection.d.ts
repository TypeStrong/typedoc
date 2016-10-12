import { DeclarationReflection } from "../reflections/declaration";
import { Type } from "./abstract";
export declare class ReflectionType extends Type {
    declaration: DeclarationReflection;
    constructor(declaration: DeclarationReflection);
    clone(): Type;
    equals(type: ReflectionType): boolean;
    toObject(): any;
    toString(): string;
}
