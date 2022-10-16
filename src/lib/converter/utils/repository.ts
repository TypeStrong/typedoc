import { spawnSync } from "child_process";
import type { Logger } from "../../utils";
import { BasePath } from "../utils/base-path";

const TEN_MEGABYTES: number = 1024 * 10000;

function git(...args: string[]) {
    return spawnSync("git", args, {
        encoding: "utf-8",
        windowsHide: true,
        maxBuffer: TEN_MEGABYTES,
    });
}

export const gitIsInstalled = git("--version").status === 0;

/**
 * Stores data of a repository.
 */
export class Repository {
    /**
     * The path of this repository on disk.
     */
    path: string;

    /**
     * All files tracked by the repository.
     */
    files = new Set<string>();

    /**
     * The base url for link creation.
     */
    baseUrl: string;

    /**
     * The anchor prefix used to select lines, usually `L`
     */
    anchorPrefix: string;

    /**
     * Create a new Repository instance.
     *
     * @param path  The root path of the repository.
     */
    constructor(path: string, baseUrl: string) {
        this.path = path;
        this.baseUrl = baseUrl;
        this.anchorPrefix = guessAnchorPrefix(this.baseUrl);

        const out = git("-C", path, "ls-files");
        if (out.status === 0) {
            out.stdout.split("\n").forEach((file) => {
                if (file !== "") {
                    this.files.add(BasePath.normalize(path + "/" + file));
                }
            });
        }
    }

    /**
     * Get the URL of the given file on GitHub or Bitbucket.
     *
     * @param fileName  The file whose URL should be determined.
     * @returns A URL pointing to the web preview of the given file or undefined.
     */
    getURL(fileName: string): string | undefined {
        if (!this.files.has(fileName)) {
            return;
        }

        return `${this.baseUrl}/${fileName.substring(this.path.length + 1)}`;
    }

    getLineNumberAnchor(lineNumber: number): string {
        return `${this.anchorPrefix}${lineNumber}`;
    }

    /**
     * Try to create a new repository instance.
     *
     * Checks whether the given path is the root of a valid repository and if so
     * creates a new instance of {@link Repository}.
     *
     * @param path  The potential repository root.
     * @returns A new instance of {@link Repository} or undefined.
     */
    static tryCreateRepository(
        path: string,
        gitRevision: string,
        gitRemote: string,
        logger: Logger
    ): Repository | undefined {
        const topLevel = git("-C", path, "rev-parse", "--show-toplevel");
        if (topLevel.status !== 0) return;

        gitRevision ||= git(
            "-C",
            path,
            "rev-parse",
            "--short",
            "HEAD"
        ).stdout.trim();
        if (!gitRevision) return; // Will only happen in a repo with no commits.

        let baseUrl: string | undefined;
        if (/^https?:\/\//.test(gitRemote)) {
            baseUrl = `${gitRemote}/${gitRevision}`;
        } else {
            const remotesOut = git("-C", path, "remote", "get-url", gitRemote);
            if (remotesOut.status === 0) {
                baseUrl = guessBaseUrl(
                    gitRevision,
                    remotesOut.stdout.split("\n")
                );
            } else {
                logger.warn(
                    `The provided git remote "${gitRemote}" was not valid. Source links will be broken.`
                );
            }
        }

        if (!baseUrl) return;

        return new Repository(
            BasePath.normalize(topLevel.stdout.replace("\n", "")),
            baseUrl
        );
    }
}

// Should have three capturing groups:
// 1. hostname
// 2. user
// 3. project
const repoExpressions = [
    /(github(?!.us)(?:\.[a-z]+)*\.[a-z]{2,})[:/]([^/]+)\/(.*)/,
    /(\w+\.githubprivate.com)[:/]([^/]+)\/(.*)/, // GitHub enterprise
    /(\w+\.ghe.com)[:/]([^/]+)\/(.*)/, // GitHub enterprise
    /(\w+\.github.us)[:/]([^/]+)\/(.*)/, // GitHub enterprise
    /(bitbucket.org)[:/]([^/]+)\/(.*)/,
    /(gitlab.com)[:/]([^/]+)\/(.*)/,
];

export function guessBaseUrl(
    gitRevision: string,
    remotes: string[]
): string | undefined {
    let hostname = "";
    let user = "";
    let project = "";
    outer: for (const repoLink of remotes) {
        for (const regex of repoExpressions) {
            const match = regex.exec(repoLink);
            if (match) {
                hostname = match[1];
                user = match[2];
                project = match[3];
                break outer;
            }
        }
    }

    if (!hostname) return;

    if (project.endsWith(".git")) {
        project = project.slice(0, -4);
    }

    let sourcePath = "blob";
    if (hostname.includes("gitlab")) {
        sourcePath = "-/blob";
    } else if (hostname.includes("bitbucket")) {
        sourcePath = "src";
    }

    return `https://${hostname}/${user}/${project}/${sourcePath}/${gitRevision}`;
}

function guessAnchorPrefix(url: string) {
    if (url.includes("bitbucket")) {
        return "lines-";
    }

    return "L";
}
