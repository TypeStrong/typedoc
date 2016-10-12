import { Type } from "../types/index";
import { Reflection, IDefaultValueContainer, ITypeContainer, ITraverseCallback } from "./abstract";
import { SignatureReflection } from "./signature";
export declare class ParameterReflection extends Reflection implements IDefaultValueContainer, ITypeContainer {
    parent: SignatureReflection;
    defaultValue: string;
    type: Type;
    traverse(callback: ITraverseCallback): void;
    toObject(): any;
    toString(): string;
}
