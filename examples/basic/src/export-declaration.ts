// This file contains some export declarations that appear before the
// symbols they export. This is done on purpose to ensure that typedoc
// does not choke on such order, which is legal as far as TS is
// concerned.
export { funcFromMod, someVarFromMod as someVarFromModRenamed, SomeClassFromMod,
         SomeInterfaceFromMod as SomeInterfaceFromModRenamed } from "./mod";
export * from "./mod2";

export { exportedLocalFunction, exportedLocalFunction2 }

function exportedLocalFunction(): boolean { return true; }

function exportedLocalFunction2(): boolean { return true; }

export { exportedLocalFunction3 as renamedExportedLocalFunction3,
         exportedLocalFunction4 as renamedExportedLocalFunction4 }

function exportedLocalFunction3(a: string, b: number): void {}
function exportedLocalFunction4(c: number, d: string): void {}

const notExportedVar = 1;
export const exportedVar1 = notExportedVar;

export const exportedVar2 = 1;

export default function defaultSymbol() {}
