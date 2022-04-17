/* eslint-disable no-console */

import { performance } from "perf_hooks";

const benchmarks: { name: string; calls: number; time: number }[] = [];

export function bench<T extends Function>(fn: T, name = fn.name): T {
    const timer = {
        name,
        calls: 0,
        time: 0,
    };
    benchmarks.push(timer);

    return function bench(this: any, ...args: any) {
        timer.calls++;
        const start = performance.now();
        let result: any;
        try {
            result = fn.apply(this, args);
        } finally {
            timer.time += performance.now() - start;
        }
        return result;
    } as any;
}

export function Bench(): MethodDecorator {
    return function (target: any, key, descriptor) {
        const rawMethod = descriptor.value as unknown as Function;
        const name = `${target.name ?? target.constructor.name}.${String(key)}`;
        descriptor.value = bench(rawMethod, name) as any;
    };
}

const anon = { name: "measure()", calls: 0, time: 0 };
export function measure<T>(cb: () => T): T {
    if (anon.calls === 0) {
        benchmarks.unshift(anon);
    }

    anon.calls++;
    const start = performance.now();
    let result: T;
    try {
        result = cb();
    } finally {
        anon.time += performance.now() - start;
    }
    return result;
}

process.on("beforeExit", () => {
    if (!benchmarks.length) return;

    const width = benchmarks.reduce((a, b) => Math.max(a, b.name.length), 11);
    console.log("=".repeat(width + 20));
    console.log(`${"Benchmarked".padEnd(width)} | Calls | Time`);
    console.log("=".repeat(width + 20));

    for (const { name, calls, time } of benchmarks) {
        console.log(
            `${name.padEnd(width)} | ${calls
                .toString()
                .padEnd(5)} | ${time.toFixed(2)}ms`
        );
    }

    console.log("=".repeat(width + 20));
});
