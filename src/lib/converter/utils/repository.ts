import { spawnSync } from "child_process";
import { RepositoryType } from "../../models";
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
     * The root path of this repository.
     */
    path: string;

    /**
     * The name of the branch this repository is on right now.
     */
    branch: string;

    /**
     * A list of all files tracked by the repository.
     */
    files: string[] = [];

    /**
     * The user/organization name of this repository on GitHub.
     */
    user?: string;

    /**
     * The project name of this repository on GitHub.
     */
    project?: string;

    /**
     * The hostname for this GitHub/Bitbucket/.etc project.
     *
     * Defaults to: `github.com` (for normal, public GitHub instance projects)
     *
     * Can be the hostname for an enterprise version of GitHub, e.g. `github.acme.com`
     * (if found as a match in the list of git remotes).
     */
    hostname = "github.com";

    /**
     * Whether this is a GitHub, Bitbucket, or other type of repository.
     */
    type: RepositoryType = RepositoryType.GitHub;

    private urlCache = new Map<string, string>();

    /**
     * Create a new Repository instance.
     *
     * @param path  The root path of the repository.
     */
    constructor(path: string, gitRevision: string, repoLinks: string[]) {
        this.path = path;
        this.branch = gitRevision || "master";

        for (let i = 0, c = repoLinks.length; i < c; i++) {
            let match =
                /(github(?:\.[a-z]+)*\.[a-z]{2,})[:/]([^/]+)\/(.*)/.exec(
                    repoLinks[i]
                );

            // Github Enterprise
            if (!match) {
                match = /(\w+\.githubprivate.com)[:/]([^/]+)\/(.*)/.exec(
                    repoLinks[i]
                );
            }

            if (!match) {
                match = /(bitbucket.org)[:/]([^/]+)\/(.*)/.exec(repoLinks[i]);
            }

            if (!match) {
                match = /(gitlab.com)[:/]([^/]+)\/(.*)/.exec(repoLinks[i]);
            }

            if (match) {
                this.hostname = match[1];
                this.user = match[2];
                this.project = match[3];
                if (this.project.endsWith(".git")) {
                    this.project = this.project.slice(0, -4);
                }
                break;
            }
        }

        if (this.hostname.includes("bitbucket.org")) {
            this.type = RepositoryType.Bitbucket;
        } else if (this.hostname.includes("gitlab.com")) {
            this.type = RepositoryType.GitLab;
        } else {
            this.type = RepositoryType.GitHub;
        }

        let out = git("-C", path, "ls-files");
        if (out.status === 0) {
            out.stdout.split("\n").forEach((file) => {
                if (file !== "") {
                    this.files.push(BasePath.normalize(path + "/" + file));
                }
            });
        }

        if (!gitRevision) {
            out = git("-C", path, "rev-parse", "--short", "HEAD");
            if (out.status === 0) {
                this.branch = out.stdout.replace("\n", "");
            }
        }
    }

    /**
     * Check whether the given file is tracked by this repository.
     *
     * @param fileName  The name of the file to test for.
     * @returns TRUE when the file is part of the repository, otherwise FALSE.
     */
    contains(fileName: string): boolean {
        return this.files.includes(fileName);
    }

    /**
     * Get the URL of the given file on GitHub or Bitbucket.
     *
     * @param fileName  The file whose URL should be determined.
     * @returns A URL pointing to the web preview of the given file or undefined.
     */
    getURL(fileName: string): string | undefined {
        if (this.urlCache.has(fileName)) {
            return this.urlCache.get(fileName)!;
        }

        if (!this.user || !this.project || !this.contains(fileName)) {
            return;
        }

        const url = [
            `https://${this.hostname}`,
            this.user,
            this.project,
            this.type === RepositoryType.GitLab ? "-" : undefined,
            this.type === RepositoryType.Bitbucket ? "src" : "blob",
            this.branch,
            fileName.substring(this.path.length + 1),
        ]
            .filter((s) => !!s)
            .join("/");

        this.urlCache.set(fileName, url);
        return url;
    }

    getLineNumberAnchor(lineNumber: number): string {
        switch (this.type) {
            default:
            case RepositoryType.GitHub:
            case RepositoryType.GitLab:
                return "L" + lineNumber;
            case RepositoryType.Bitbucket:
                return "lines-" + lineNumber;
        }
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
        gitRemote: string
    ): Repository | undefined {
        const out = git("-C", path, "rev-parse", "--show-toplevel");
        const remotesOutput = git("-C", path, "remote", "get-url", gitRemote);

        if (out.status !== 0 || remotesOutput.status !== 0) {
            return;
        }

        return new Repository(
            BasePath.normalize(out.stdout.replace("\n", "")),
            gitRevision,
            remotesOutput.stdout.split("\n")
        );
    }
}
