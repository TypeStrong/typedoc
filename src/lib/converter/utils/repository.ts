import { normalizePath } from "../../utils/index.js";
import { i18n, type Logger, NonEnumerable, type NormalizedPath, NormalizedPathUtils } from "#utils";
import { join } from "path";
import { stat } from "node:fs/promises";

import { spawn, spawnSync } from "node:child_process";
import { relative } from "node:path";

export interface SpawnResult {
    status: number | null;
    stdout: string;
    stderr: string;
    errorCode?: string;
}

let gitIsInstalled: boolean | undefined = undefined;

function gitAsync(...args: string[]) {
    const child = spawn("git", args, { windowsHide: true });
    const promise = new Promise<SpawnResult>((resolve) => {
        const stdout: string[] = [];
        const stderr: string[] = [];
        child.stdout.setEncoding("utf-8");
        child.stderr.setEncoding("utf-8");
        child.stdout.on("data", (chunk: string) => {
            stdout.push(chunk);
        });
        child.stderr.on("data", (chunk: string) => {
            stderr.push(chunk);
        });
        child.once("error", (err: NodeJS.ErrnoException) => {
            resolve({
                status: null,
                stdout: stdout.join(""),
                stderr: stderr.join(""),
                errorCode: err.code ?? "EUNKNOWN",
            });
        });
        child.once("close", (code) => {
            resolve({ status: code, stdout: stdout.join(""), stderr: stderr.join("") });
        });
    });

    return { child, promise };
}

export interface Repository {
    readonly path: string;
    getURL(fileName: string, line: number): string | undefined;
}

export class AssumedRepository implements Repository {
    constructor(
        readonly path: string,
        readonly gitRevision: string,
        readonly sourceLinkTemplate: string,
    ) {}

    getURL(fileName: string, line: number): string | undefined {
        const replacements = {
            gitRevision: this.gitRevision,
            "gitRevision:short": this.gitRevision.substring(0, 8),
            path: relative(this.path, fileName).replaceAll("\\", "/"),
            line,
        };

        return this.sourceLinkTemplate.replace(
            /\{(gitRevision|gitRevision:short|path|line)\}/g,
            (_, key) => replacements[key as never],
        );
    }
}

/**
 * Stores data of a repository.
 */
export class GitRepository implements Repository {
    /**
     * The path of this repository on disk.
     */
    path: string;

    /**
     * All files tracked by the repository.
     */
    @NonEnumerable
    files = new Set<string>();

    urlTemplate: string;
    gitRevision: string;

    /**
     * Create a new Repository instance.
     *
     * @param path  The root path of the repository.
     */
    constructor(path: string, gitRevision: string, urlTemplate: string) {
        this.path = path;
        this.gitRevision = gitRevision;
        this.urlTemplate = urlTemplate;
    }

    /**
     * Get the URL of the given file on GitHub or Bitbucket.
     *
     * @param fileName  The file whose URL should be determined.
     * @returns A URL pointing to the web preview of the given file or undefined.
     */
    getURL(fileName: string, line: number): string | undefined {
        if (!this.files.has(fileName)) {
            return;
        }

        const replacements = {
            gitRevision: this.gitRevision,
            "gitRevision:short": this.gitRevision.substring(0, 8),
            path: fileName.substring(this.path.length + 1),
            line,
        };

        return this.urlTemplate.replace(
            /\{(gitRevision|gitRevision:short|path|line)\}/g,
            (_, key) => replacements[key as never],
        );
    }

    /**
     * Try to create a new repository instance.
     *
     * Checks whether the given path is the root of a valid repository and if so
     * creates a new instance of {@link GitRepository}.
     *
     * @param path  The potential repository root.
     * @returns A promise resolving to {@link GitRepository} or undefined.
     */
    static async tryCreateRepository(
        path: string,
        sourceLinkTemplate: string,
        gitRevision: string,
        gitRemote: string,
        logger: Logger,
    ): Promise<GitRepository | undefined> {
        // Asynchronously start getting all the git information we will need.
        const branchPromise = gitRevision === "{branch}"
            ? gitAsync("-C", path, "branch", "--show-current").promise
            : Promise.resolve({ status: 0, stdout: "", stderr: "" } as const);
        const headPromise = gitRevision === "" || gitRevision === "{branch}"
            ? gitAsync("-C", path, "rev-parse", "HEAD").promise
            : Promise.resolve({ status: 0, stdout: gitRevision, stderr: "" } as const);

        // Assume the branch and/or head calls will get us a real branch name, and start
        // requesting the URL and files now, even though we might not need them.
        const getUrlCall = sourceLinkTemplate ? undefined : gitAsync("-C", path, "remote", "get-url", gitRemote);
        const lsFilesCall = gitAsync("-C", path, "ls-files", "-z");

        const [branchOut, headOut] = await Promise.all([branchPromise, headPromise]);

        let rev = gitRevision;
        if (rev === "{branch}") rev = branchOut.stdout.trim();
        if (!rev) rev = headOut.stdout.trim();
        if (rev === "HEAD") {
            // If we don't have a revision, then this isn't a repository.
            // Kill the get-url and ls-files calls in case they are still running and return undefined
            if (getUrlCall?.child.exitCode == null) {
                getUrlCall?.child.kill();
            }
            if (lsFilesCall.child.exitCode == null) {
                lsFilesCall.child.kill();
            }
            return;
        }

        const remotesOut = await getUrlCall?.promise;
        let urlTemplate: string | undefined;
        if (sourceLinkTemplate) {
            urlTemplate = sourceLinkTemplate;
        } else if (remotesOut!.status === 0) {
            urlTemplate = guessSourceUrlTemplate(remotesOut!.stdout.split("\n"));
        } else {
            logger.warn(i18n.git_remote_0_not_valid(gitRemote));
        }
        if (!urlTemplate) {
            if (lsFilesCall.child.exitCode == null) {
                lsFilesCall.child.kill();
            }
            return;
        }

        const lsFilesOut = await lsFilesCall.promise;
        const repo = new GitRepository(normalizePath(path), rev, urlTemplate);
        if (lsFilesOut.status === 0) {
            for (const file of lsFilesOut.stdout.split("\0")) {
                if (file !== "") {
                    repo.files.add(normalizePath(path + "/" + file));
                }
            }
        }
        return repo;
    }
}

/**
 * Responsible for keeping track of 0-N repositories which exist on a machine.
 * This used to be inlined in SourcePlugin, moved out for easy unit testing.
 *
 * Git repositories can be nested. Files should be resolved to a repo as shown
 * below:
 * ```text
 * /project
 * /project/.git (A)
 * /project/file.js (A)
 * /project/folder/file.js (A)
 * /project/sub/.git (B)
 * /project/sub/file.js (B)
 * ```
 *
 * In order words, it is not safe to assume that just because a file is within
 * the `/project` directory, that it belongs to repo `A`. As calling git is
 * expensive (~20-300ms depending on the machine, antivirus, etc.) we check for
 * `.git` folders manually, and only call git if one is found.
 *
 * Symlinked files have the potential to further complicate this. If TypeScript's
 * `preserveSymlinks` option is on, then this may be passed the path to a symlinked
 * file. Unlike TypeScript, we will resolve the path, as the repo link should really
 * point to the actual file.
 */
export class RepositoryManager {
    private repositories = new Map<string, Repository | undefined>();
    private assumedRepo: Repository;

    constructor(
        private basePath: string,
        private gitRevision: string,
        private gitRemote: string,
        private sourceLinkTemplate: string,
        private disableGit: boolean,
        private logger: Logger,
    ) {
        this.assumedRepo = new AssumedRepository(
            this.basePath,
            this.gitRevision,
            this.sourceLinkTemplate,
        );
    }

    private async discoverPossibleGitDirs(dirs: readonly NormalizedPath[]) {
        let queue = dirs;
        const checkedDirs = new Set<NormalizedPath>();
        const possibleGitDirs: NormalizedPath[] = [];

        while (queue.length) {
            const dirCouldBeGitDir = await Promise.all(queue.map(async dir => {
                checkedDirs.add(dir);
                try {
                    const gitStats = await stat(join(dir, ".git"));
                    return gitStats.isDirectory();
                } catch {
                    return false;
                }
            }));

            const nextQueue = new Set<NormalizedPath>();
            for (let i = 0; i < queue.length; ++i) {
                if (dirCouldBeGitDir[i]) {
                    possibleGitDirs.push(queue[i]);
                } else {
                    const parent = NormalizedPathUtils.dirname(queue[i]);
                    if (!checkedDirs.has(parent) && parent !== queue[i]) {
                        nextQueue.add(NormalizedPathUtils.dirname(queue[i]));
                    }
                }
            }
            queue = Array.from(nextQueue);
        }

        return possibleGitDirs;
    }

    async initializeRepositoriesForDirs(dirs: readonly string[]) {
        if (gitIsInstalled === undefined) {
            gitIsInstalled = spawnSync("git", ["--version"]).status === 0;
        }

        // If we don't have git there's no point in even checking for repositories
        if (!gitIsInstalled) {
            return;
        }

        // Get all the directories we need to check for a git repo within
        const possibleGitDirs = await this.discoverPossibleGitDirs(dirs.map(normalizePath));

        // Now split those directories in two -- they are either a top level git directory
        // which we should create a repository for, or they are could be a symlink to a top level git
        // directory.
        const symlinkedGitDirs = new Map<NormalizedPath, NormalizedPath>();
        const topLevelGitDirs = new Set<NormalizedPath>();
        await Promise.all(possibleGitDirs.map(async dir => {
            const topLevel = await gitAsync("-C", dir, "rev-parse", "--show-toplevel").promise;
            if (topLevel.status !== 0) return; // Not a git dir
            const repoDir = normalizePath(topLevel.stdout.replace("\n", ""));
            topLevelGitDirs.add(repoDir);
            if (repoDir !== dir) {
                symlinkedGitDirs.set(dir, repoDir);
            }
        }));

        // Now we can create repositories for each important directory.
        await Promise.all(Array.from(topLevelGitDirs, async repoDir => {
            const repo = await GitRepository.tryCreateRepository(
                repoDir,
                this.sourceLinkTemplate,
                this.gitRevision,
                this.gitRemote,
                this.logger,
            );
            this.repositories.set(repoDir, repo);
        }));

        // Save resolved symlinks
        for (const [source, target] of symlinkedGitDirs) {
            this.repositories.set(source, this.repositories.get(target));
        }
    }

    getURL(fileName: NormalizedPath, line: number): string | undefined {
        return this.getRepository(fileName)?.getURL(fileName, line);
    }

    getRepository(fileName: NormalizedPath): Repository | undefined {
        if (this.disableGit) {
            return this.assumedRepo;
        }

        const expectedDir = NormalizedPathUtils.dirname(fileName);
        if (this.repositories.has(expectedDir)) {
            return this.repositories.get(expectedDir);
        }

        // In the case where this directory isn't in the repositories cache, try the parent paths too.
        let working = expectedDir;
        let parent = NormalizedPathUtils.dirname(working);
        while (parent !== working) {
            if (this.repositories.has(parent)) {
                // To avoid extra dirname calls in future resolutions, save where we found the repository
                const result = this.repositories.get(parent);
                this.repositories.set(expectedDir, result);
                return result;
            }
            working = parent;
            parent = NormalizedPathUtils.dirname(working);
        }

        // This folder isn't in a repository, record that in case we look it up again
        this.repositories.set(expectedDir, undefined);
        return undefined;
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

export function guessSourceUrlTemplate(remotes: string[]): string | undefined {
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
    let anchorPrefix = "L";
    if (hostname.includes("gitlab")) {
        sourcePath = "-/blob";
    } else if (hostname.includes("bitbucket")) {
        sourcePath = "src";
        anchorPrefix = "lines-";
    }

    return `https://${hostname}/${user}/${project}/${sourcePath}/{gitRevision}/{path}#${anchorPrefix}{line}`;
}
