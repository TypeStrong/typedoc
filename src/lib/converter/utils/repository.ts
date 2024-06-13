import { spawnSync } from "child_process";
import type { Logger } from "../../utils";
import { BasePath } from "../utils/base-path";
import { NonEnumerable } from "../../utils/general";
import { dirname } from "path";
import { insertSorted } from "../../utils/array";

const TEN_MEGABYTES = 1024 * 10000;

function git(...args: string[]) {
    return spawnSync("git", args, {
        encoding: "utf-8",
        windowsHide: true,
        maxBuffer: TEN_MEGABYTES,
    });
}

let haveGit: boolean | undefined;
export function gitIsInstalled() {
    haveGit ??= git("--version").status === 0;
    return haveGit;
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
            path: fileName.substring(this.path.length + 1),
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

        const out = git("-C", path, "ls-files", "-z");
        if (out.status === 0) {
            out.stdout.split("\0").forEach((file) => {
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
     * @returns A new instance of {@link GitRepository} or undefined.
     */
    static tryCreateRepository(
        path: string,
        sourceLinkTemplate: string,
        gitRevision: string,
        gitRemote: string,
        logger: Logger,
    ): GitRepository | undefined {
        const topLevel = git("-C", path, "rev-parse", "--show-toplevel");
        if (topLevel.status !== 0) return;

        gitRevision ||= git("-C", path, "rev-parse", "HEAD").stdout.trim();
        if (!gitRevision) return; // Will only happen in a repo with no commits.

        let urlTemplate: string | undefined;
        if (sourceLinkTemplate) {
            urlTemplate = sourceLinkTemplate;
        } else {
            const remotesOut = git("-C", path, "remote", "get-url", gitRemote);
            if (remotesOut.status === 0) {
                urlTemplate = guessSourceUrlTemplate(
                    remotesOut.stdout.split("\n"),
                );
            } else {
                logger.warn(logger.i18n.git_remote_0_not_valid(gitRemote));
            }
        }

        if (!urlTemplate) return;

        return new GitRepository(
            BasePath.normalize(topLevel.stdout.replace("\n", "")),
            gitRevision,
            urlTemplate,
        );
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
 * Symlinks further complicate this.
 */
export class RepositoryManager {
    ignoredPaths = new Set<string>();
    repositories: Repository[] = [];

    constructor(
        readonly basePath: string,
        readonly gitRevision: string,
        readonly gitRemote: string,
        readonly sourceLinkTemplate: string,
        readonly disableGit: boolean,
        readonly logger: Logger,
    ) {}

    /**
     * Check whether the given file is placed inside a repository.
     *
     * @param fileName  The name of the file a repository should be looked for.
     * @returns The found repository info or undefined.
     */
    getRepository(fileName: string): Repository | undefined {
        if (this.disableGit) {
            return new AssumedRepository(
                this.basePath,
                this.gitRevision,
                this.sourceLinkTemplate,
            );
        }
        // Check for known non-repositories
        const dirName = dirname(fileName);
        if (this.ignoredPaths.has(dirName)) {
            return;
        }

        // Check for known repositories
        for (const repo of this.repositories) {
            if (fileName.startsWith(repo.path)) {
                return repo;
            }
        }

        // If git has been disabled, and this is outside of our base path,
        // then we shouldn't create links to the file.
        if (this.disableGit) return;

        // Try to create a new repository
        const repository = GitRepository.tryCreateRepository(
            dirName,
            this.sourceLinkTemplate,
            this.gitRevision,
            this.gitRemote,
            this.logger,
        );
        if (repository) {
            insertSorted(
                this.repositories,
                repository,
                (repo) => repo.path.length < repository.path.length,
            );
            return repository;
        }

        // No repository found, add all parent paths to ignored paths
        // as they definitely don't contain git repos.
        this.ignoredPaths.add(dirName);
        let index = dirName.lastIndexOf("/");
        while (index > 0) {
            this.ignoredPaths.add(dirName.slice(0, index));
            index = dirName.lastIndexOf("/", index - 1);
        }
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
