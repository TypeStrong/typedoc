export class Component {}

type Constructor<T = Record<any, any>> = new (...args: any[]) => T;

export function Readable<TBase extends Constructor<Component>>(Base: TBase) {
    abstract class Reader extends Base {}
    return Reader;
}
