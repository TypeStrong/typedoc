import { ok } from "assert";
import { Validation } from "../../lib/utils";
import { additionalProperties } from "../../lib/utils/validation";

describe("Validation Utils", () => {
    it("Should be able to validate optional values", () => {
        ok(Validation.validate(Validation.optional(String), null));
        ok(Validation.validate(Validation.optional(String), undefined));
        ok(Validation.validate(Validation.optional(String), ""));
    });

    it("Should be able to validate a boolean", () => {
        ok(Validation.validate(Boolean, false));
        ok(!Validation.validate(Boolean, 123));
        ok(!Validation.validate(Boolean, ""));
    });

    it("Should be able to validate a number", () => {
        ok(!Validation.validate(Number, false));
        ok(Validation.validate(Number, 123));
        ok(!Validation.validate(Number, ""));
    });

    it("Should be able to validate a string", () => {
        ok(!Validation.validate(String, false));
        ok(!Validation.validate(String, 123));
        ok(Validation.validate(String, ""));
    });

    it("Should be able to validate an array", () => {
        ok(Validation.validate([Array, String], []));
        ok(Validation.validate([Array, String], ["a"]));
        ok(!Validation.validate([Array, String], ["a", 1]));
    });

    it("Should be able to validate with a custom function", () => {
        ok(Validation.validate(Validation.isTagString, "@foo"));
        ok(!Validation.validate(Validation.isTagString, true));
    });

    it("Should be able to validate a set of literals", () => {
        ok(Validation.validate(["a", "b", "c"] as const, "a"));
        ok(Validation.validate(["a", "b", "c"] as const, "c"));
        ok(!Validation.validate(["a", "b", "c"] as const, "d"));
    });

    it("Should be able to validate an object", () => {
        const schema = {
            x: String,
            y: Validation.optional(Number),
        };

        ok(Validation.validate(schema, { x: "" }));
        ok(Validation.validate(schema, { x: "", y: 0 }));
        ok(Validation.validate(schema, { x: "", y: 0, z: 123 }));
        ok(!Validation.validate(schema, { y: 123 }));
        ok(!Validation.validate(schema, null));
        ok(!Validation.validate(schema, true));
    });

    it("Should support not checking for excess properties (default)", () => {
        const schema = {
            x: String,
            [additionalProperties]: true,
        };

        ok(Validation.validate(schema, { x: "" }));
        ok(Validation.validate(schema, { x: "", y: "" }));
    });

    it("Should support checking for excess properties", () => {
        const schema = {
            x: String,
            [additionalProperties]: false,
        };

        ok(Validation.validate(schema, { x: "" }));
        ok(!Validation.validate(schema, { x: "", y: "" }));
    });
});
