import { Type, TypeParameterType } from "../types/index";
import { Reflection, ITypeContainer } from "./abstract";
import { DeclarationReflection } from "./declaration";
export declare class TypeParameterReflection extends Reflection implements ITypeContainer {
    parent: DeclarationReflection;
    type: Type;
    constructor(parent?: Reflection, type?: TypeParameterType);
    toObject(): any;
}
