export function funcFromMod2(a: number): void {
    a++;
}

export const someVarFromMod2: string = "some value";

export class SomeClassFromMod2 {
    property: number = 1;
}

export interface SomeInterfaceFromMod2 {
    foo: number;
}

export { funcFromMod as funcFromModRenamedInMod2 } from "./mod";
