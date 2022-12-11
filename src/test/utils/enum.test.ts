import { ok } from "assert";
import { ReflectionKind } from "../../lib/models";
import { getEnumKeys } from "../../lib/utils/enum";

describe("Enum utils", () => {
    it("Should be able to get enum keys", () => {
        const keys = getEnumKeys(ReflectionKind);
        ok(keys.includes("Project"));
        ok(!keys.includes("SignatureContainer"));
    });
});
