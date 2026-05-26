import { spawn } from "node:child_process";

export interface GitSpawnResult {
    status: number | null;
    stdout: string;
    stderr: string;
}

export function gitSpawn(command: string, args: string[]): Promise<GitSpawnResult> {
    return new Promise((resolve) => {
        const child = spawn(command, args, { windowsHide: true });
        let stdout = "";
        let stderr = "";
        child.stdout.setEncoding("utf-8");
        child.stderr.setEncoding("utf-8");
        child.stdout.on("data", (chunk) => { stdout += chunk; });
        child.stderr.on("data", (chunk) => { stderr += chunk; });
        child.once("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "ENOENT") {
                resolve({ status: null, stdout, stderr });
            } else {
                resolve({ status: 1, stdout, stderr });
            }
        });
        child.once("close", (code) => {
            resolve({ status: code, stdout, stderr });
        });
    });
}
