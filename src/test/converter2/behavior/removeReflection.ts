export function foo(first: string, second: string, third: string) {
    first;
    second;
    third;
}

export function nested(a: 1 | { a; 1 }) {}

export interface Base {}
/** @hidden */
export interface Hidden extends Base {}
export interface NotHidden extends Hidden {}

export class NotHiddenImpl implements Hidden {}
