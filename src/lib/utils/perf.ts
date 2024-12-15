/* eslint-disable no-console */

import { performance } from "perf_hooks";

const benchmarks: { name: string; calls: number; time: number }[] = [];

export function bench<T extends (..._: any) => any>(
    fn: T,
    name: string = fn.name,
): T {
    const matching = benchmarks.find((b) => b.name === name);
    const timer = matching || {
        name,
        calls: 0,
        time: 0,
    };
    if (!matching) benchmarks.push(timer);

    return function bench(this: any, ...args: any) {
        timer.calls++;
        const start = performance.now();
        const end = () => (timer.time += performance.now() - start);
        let result: any;
        try {
            result = fn.apply(this, args);
        } catch (error) {
            end();
            throw error;
        }

        if (result instanceof Promise) {
            result.then(
                (res) => {
                    end();
                    return res;
                },
                (reason: unknown) => {
                    end();
                    throw reason;
                },
            );
        } else {
            end();
        }

        return result;
    } as any;
}

function BenchField<T extends (..._: any) => any>(
    _value: undefined,
    context: ClassFieldDecoratorContext<unknown, T>,
): (value: T) => T {
    let runner: T | undefined;

    return function (this: any, value: T) {
        if (!runner) {
            const className = context.static
                ? this.name
                : Object.getPrototypeOf(this).constructor.name;
            runner = bench(value, `${className}.${String(context.name)}`);
        }

        return function (this: any, ...args: any) {
            return runner!.apply(this, args);
        } as T;
    };
}

function BenchMethod<T extends (..._: any) => any>(
    value: T,
    context: ClassMethodDecoratorContext,
): T {
    let runner: T | undefined;

    return function (this: any, ...args: any) {
        if (!runner) {
            const className = context.static
                ? this.name
                : Object.getPrototypeOf(this).constructor.name;
            runner = bench(value, `${className}.${String(context.name)}`);
        }
        return runner.apply(this, args);
    } as any;
}

export const Bench: typeof BenchField & typeof BenchMethod = (
    value: any,
    context,
) => {
    if (context.kind === "field") {
        return BenchField(value, context);
    }
    return BenchMethod(value, context);
};

export function measure<T>(cb: () => T): T {
    return bench(cb, "measure()")();
}

process.on("exit", () => {
    if (!benchmarks.length) return;

    const table = benchmarks.map((b) => {
        return {
            Benchmarked: b.name,
            Calls: b.calls,
            "Time (ms)": Math.round(b.time * 100) / 100,
            "Average (ms)": Math.round((b.time / b.calls) * 100) / 100,
        };
    });

    console.table(table);
});
