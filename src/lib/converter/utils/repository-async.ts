import { spawn } from "node:child_process";

/**
 * Result of a non-throwing async child-process spawn.
 *
 * `status: null` means the child failed to start (binary not found, permission denied, etc.);
 * `errorCode` carries the underlying `NodeJS.ErrnoException` code in that case (e.g. `"ENOENT"`,
 * `"EACCES"`, `"EMFILE"`, or `"EUNKNOWN"` when no code was provided).
 * `status: number` is the child's exit code (zero or non-zero) from a normal close — `errorCode`
 * is absent in that case.
 */
export interface SpawnResult {
    status: number | null;
    stdout: string;
    stderr: string;
    errorCode?: string;
}

/**
 * Run a child process and resolve with its stdout, stderr, and exit status — never rejects.
 *
 * Mirrors the no-throw contract of the existing `spawnSync`-based `git()` helper in
 * `repository.ts`, but executes asynchronously so callers can issue multiple spawns
 * in parallel via `Promise.all`.
 *
 * Uses `child_process.spawn` (not `exec`) for safety: no shell, no command-string parsing.
 *
 * @param command Executable name or path.
 * @param args Arguments passed to the child.
 * @returns A {@link SpawnResult} describing how the child finished. On successful close,
 *   `status` is the exit code and `errorCode` is absent. On startup failure, `status` is
 *   `null` and `errorCode` identifies the failure mode.
 */
export function spawnAsync(command: string, args: string[]): Promise<SpawnResult> {
    return new Promise((resolve) => {
        const child = spawn(command, args, { windowsHide: true });
        let stdout = "";
        let stderr = "";
        child.stdout.setEncoding("utf-8");
        child.stderr.setEncoding("utf-8");
        child.stdout.on("data", (chunk) => { stdout += chunk; });
        child.stderr.on("data", (chunk) => { stderr += chunk; });
        child.once("error", (err: NodeJS.ErrnoException) => {
            resolve({ status: null, stdout, stderr, errorCode: err.code ?? "EUNKNOWN" });
        });
        child.once("close", (code) => {
            resolve({ status: code, stdout, stderr });
        });
    });
}
