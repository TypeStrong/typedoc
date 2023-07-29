export class TypeEmitter<T, TOptions extends object = Record<string, never>> {}

export function createAssetEmitter<T, TOptions extends object>(
    TypeEmitterClass: typeof TypeEmitter<T, TOptions>,
): void {}
