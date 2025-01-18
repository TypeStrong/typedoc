export interface T<A, B = number, C = string> {
    a: A;
    b: B;
    c: C;
}

export function f0(a: T<number, number, boolean>): T<number, number, boolean> {
    return a;
}

export function f1(a: T<string>): T<string> {
    return a;
}

export function f2(a: T<number>): T<number> {
    return a;
}

export function f3(a: T<number, number>): T<number, number> {
    return a;
}

export function f4(a: T<number, string>): T<number, string> {
    return a;
}

export function f5(a: T<string, string>): T<string, string> {
    return a;
}

export function f6(a: T<number, string, string>): T<number, string, string> {
    return a;
}

export function f7(a: T<number, number, string>): T<number, number, string> {
    return a;
}
