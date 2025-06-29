import { deepStrictEqual as equal, ok } from "assert";
import { DefaultMap, StableKeyMap } from "#utils";

describe("DefaultMap", () => {
    it("Creates entries if they do not exist", () => {
        const map = new DefaultMap<string, number>(() => 123);

        equal(map.get("a"), 123);
        map.set("b", 5);
        equal(map.get("b"), 5);
        equal(map.getNoInsert("c"), undefined);
    });
});

describe("StableKeyMap", () => {
    interface StableKeyed {
        getStableKey(): string;
    }
    const a = {
        id: 1,
        getStableKey() {
            return "a";
        },
    };
    const a2 = {
        id: 2,
        getStableKey() {
            return "a";
        },
    };

    it("Inserts objects via a stable key", () => {
        const map = new StableKeyMap<StableKeyed, number>();

        equal(map.size, 0);
        map.set(a, 1);
        equal(map.size, 1);
        equal(map.get(a), 1);
        equal(map.get(a2), 1);
    });

    it("Supports clear()", () => {
        const map = new StableKeyMap<StableKeyed, number>();
        map.set(a, 1);
        map.clear();
        equal(map.size, 0);
    });

    it("Supports delete()", () => {
        const map = new StableKeyMap<StableKeyed, number>();
        map.set(a, 1);
        equal(map.delete(a2), true);
        equal(map.size, 0);
    });

    it("Supports forEach()", () => {
        const map = new StableKeyMap<StableKeyed, number>();
        map.set(a, 1);
        let called = false;
        map.forEach((value, key, map2) => {
            called = true;
            equal(value, 1);
            ok(key === a);
            ok(map === map2);
        });
        ok(called);
    });

    it("Supports entries()", () => {
        const map = new StableKeyMap<StableKeyed, number>();
        map.set(a, 1);
        let called = false;
        for (const [key, value] of map.entries()) {
            called = true;
            equal(value, 1);
            ok(key === a);
        }
        ok(called);
    });

    it("Supports keys()", () => {
        const map = new StableKeyMap<StableKeyed, number>();
        map.set(a, 1);
        let called = false;
        for (const key of map.keys()) {
            called = true;
            ok(key === a);
        }
        ok(called);
    });

    it("Supports values()", () => {
        const map = new StableKeyMap<StableKeyed, number>();
        map.set(a, 1);
        let called = false;
        for (const value of map.values()) {
            called = true;
            equal(value, 1);
        }
        ok(called);
    });

    it("Supports [Symbol.iterator]", () => {
        const map = new StableKeyMap<StableKeyed, number>();
        map.set(a, 1);
        let called = false;
        for (const [key, value] of map) {
            called = true;
            equal(value, 1);
            ok(key === a);
        }
        ok(called);
    });
});
