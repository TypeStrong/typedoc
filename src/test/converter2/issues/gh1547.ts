export interface ThingA {
    type: "ThingA";
}

export interface ThingB {
    type: "ThingB";
}

type Things = ThingA | ThingB;

type ValueOrArray<T> = T | Array<ValueOrArray<T>>;

/**
 * Test.
 */
export class Test {
    /**
     * Log a thing.
     *
     * @param things - Array of things or a thing.
     */
    log_thing(things: ValueOrArray<Things>): void {
        console.log(things);
    }
}
