export interface Test {
    /** A */
    method(a: string): boolean;

    /** B */
    method(a: number): number;
}

export class Class implements Test {
    method(a: string): boolean;
    method(a: number): number;
    method(a: string | number): number | boolean {
        if (typeof a === "string") {
            return false;
        }
        return 1;
    }
}

export interface MultiCallSignature {
    /** A */
    (): string;
    /** B */
    (x: string): string;
}

export const Callable: MultiCallSignature = () => "";
