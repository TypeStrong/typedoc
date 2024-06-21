import { deepStrictEqual as equal } from "assert";
import { EventDispatcher } from "../lib/utils";

describe("EventDispatcher", () => {
    it("Works in simple cases", () => {
        const emitter = new EventDispatcher<{ a: [] }>();

        let calls = 0;
        emitter.on("a", () => {
            calls++;
        });
        equal(calls, 0);

        emitter.trigger("a");
        equal(calls, 1);
        emitter.trigger("a");
        equal(calls, 2);
    });

    it("Allows removing listeners", () => {
        const emitter = new EventDispatcher<{ a: [] }>();

        let calls = 0;
        const listener = () => {
            calls++;
        };
        emitter.off("a", listener);
        equal(calls, 0);

        emitter.trigger("a");
        equal(calls, 0);
    });

    it("Works correctly with missing listeners", () => {
        const emitter = new EventDispatcher<{ a: [] }>();

        let calls = 0;
        const listener = () => {
            calls++;
        };
        emitter.on("a", () => {
            calls++;
        });
        emitter.off("a", listener);

        emitter.trigger("a");
        equal(calls, 1);
    });

    it("Works if a listener is removed while emitting", () => {
        const emitter = new EventDispatcher<{ a: [] }>();

        let calls = 0;
        emitter.on("a", function rem() {
            calls++;
            emitter.off("a", rem);
        });
        emitter.on("a", () => {
            calls++;
        });
        equal(calls, 0);

        emitter.trigger("a");
        equal(calls, 2);
        emitter.trigger("a");
        equal(calls, 3);
    });

    it("Calls listeners according to their order", () => {
        const emitter = new EventDispatcher<{ a: [] }>();

        const calls: number[] = [];
        emitter.on("a", () => calls.push(3), 25);
        emitter.on("a", () => calls.push(2), 50);
        emitter.on("a", () => calls.push(1), 50);

        emitter.trigger("a");
        equal(calls, [1, 2, 3]);
    });
});
