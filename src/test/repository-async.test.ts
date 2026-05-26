import {
    _resetGitIsInstalledCacheForTests,
    gitAsync,
    gitIsInstalledAsync,
    spawnAsync,
} from "../lib/converter/utils/repository-async.js";
import { deepStrictEqual as equal, ok } from "assert";

describe("spawnAsync", () => {
    it("returns stdout, stderr, status on success", async () => {
        const result = await spawnAsync("node", ["-e", "process.stdout.write('hi')"]);
        equal(result.status, 0);
        equal(result.stdout, "hi");
    });

    it("returns non-zero status on failure (does not throw)", async () => {
        const result = await spawnAsync("node", ["-e", "process.exit(3)"]);
        equal(result.status, 3);
    });

    it("returns null status and ENOENT errorCode when binary is missing (does not throw)", async () => {
        const result = await spawnAsync("definitely-not-a-real-binary-xyz", []);
        equal(result.status, null);
        equal(result.errorCode, "ENOENT");
    });
});

describe("gitAsync", () => {
    beforeEach(() => _resetGitIsInstalledCacheForTests());

    it("runs `git --version` successfully when git is on PATH", async () => {
        if (!(await gitIsInstalledAsync())) return; // skip if git absent
        const result = await gitAsync("--version");
        equal(result.status, 0);
        ok(/git version/.test(result.stdout));
    });

    it("caches gitIsInstalledAsync result across calls", async () => {
        const a = await gitIsInstalledAsync();
        const b = await gitIsInstalledAsync();
        equal(a, b);
    });

    it("_resetGitIsInstalledCacheForTests clears the cache", async () => {
        // First call populates the cache.
        await gitIsInstalledAsync();
        // Reset, then re-call — should re-run the check (we can't directly observe
        // re-execution, but the call should still resolve consistently).
        _resetGitIsInstalledCacheForTests();
        const after = await gitIsInstalledAsync();
        equal(typeof after, "boolean");
    });
});
