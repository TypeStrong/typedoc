import { gitSpawn } from "../lib/converter/utils/repository-async.js";
import { deepStrictEqual as equal, ok } from "assert";

describe("gitSpawn", () => {
    it("returns stdout, stderr, status on success", async () => {
        const result = await gitSpawn("node", ["-e", "process.stdout.write('hi')"]);
        equal(result.status, 0);
        equal(result.stdout, "hi");
    });

    it("returns non-zero status on failure (does not throw)", async () => {
        const result = await gitSpawn("node", ["-e", "process.exit(3)"]);
        equal(result.status, 3);
    });

    it("returns null status when binary is missing (does not throw)", async () => {
        const result = await gitSpawn("definitely-not-a-real-binary-xyz", []);
        equal(result.status, null);
    });
});
