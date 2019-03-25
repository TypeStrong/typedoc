export const x = 5;

export function add(x: number, y: number) {
    return x + y;
}

export function times(x: number, y: number) {
    return x * y;
}

export class NotDocumented {
    some!       : string
}

export interface INotDocumented {
    some        : string
}
