/** First */
export function foo(fatal: true): string;
export function foo(fatal: false): string | undefined;
/** Third */
export function foo(fatal: string): string | undefined;
export function foo(fatal: unknown): string | undefined {
    return "";
}

export declare class Foo {
    /** First */
    bar(): string;
    bar(x: string): number;
    /** Third */
    bar(x: number): number;
}
