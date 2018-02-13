import { Type, TypeParameterType } from '../types/index';
import { Reflection, TypeContainer } from './abstract';
import { DeclarationReflection } from './declaration';
export declare class TypeParameterReflection extends Reflection implements TypeContainer {
    parent: DeclarationReflection;
    type: Type;
    constructor(parent?: Reflection, type?: TypeParameterType);
    toObject(): any;
}
