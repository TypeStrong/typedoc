import {
    GitRepository,
    guessSourceUrlTemplate,
    RepositoryManager,
} from "../lib/converter/utils/repository";
import { deepStrictEqual as equal, ok } from "assert";
import { type Project, tempdirProject } from "@typestrong/fs-fixture-builder";
import { spawnSync } from "child_process";
import { TestLogger } from "./TestLogger";
import { join } from "path";
import { normalizePath } from "../lib/utils/paths";

function git(cwd: string, ...args: string[]) {
    const env = {
        GIT_AUTHOR_NAME: "test",
        GIT_AUTHOR_EMAIL: "test@example.com",
        GIT_AUTHOR_DATE: "2024-03-31T22:04:50.119Z",
        GIT_COMMITTER_NAME: "test",
        GIT_COMMITTER_EMAIL: "test@example.com",
        GIT_COMMITTER_DATE: "2024-03-31T22:04:50.119Z",
    };
    return spawnSync("git", ["-C", cwd, ...args], {
        encoding: "utf-8",
        windowsHide: true,
        env,
    });
}

describe("Repository", function () {
    describe("guessSourceUrlTemplate helper", () => {
        it("handles a personal GitHub HTTPS URL", () => {
            const mockRemotes = ["https://github.com/joebloggs/foobar.git"];

            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://github.com/joebloggs/foobar/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("handles a personal GitHub SSH URL", () => {
            const mockRemotes = ["git@github.com:TypeStrong/typedoc.git"];

            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://github.com/TypeStrong/typedoc/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("handles an enterprise GitHub URL", () => {
            const mockRemotes = ["git@github.acme.com:joebloggs/foobar.git"];
            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://github.acme.com/joebloggs/foobar/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("handles an enterprise GitHub URL", () => {
            const mockRemotes = [
                "ssh://org@bigcompany.githubprivate.com/joebloggs/foobar.git",
            ];
            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://bigcompany.githubprivate.com/joebloggs/foobar/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("handles a ghe.com URL", () => {
            const mockRemotes = [
                "ssh://org@bigcompany.ghe.com/joebloggs/foobar.git",
            ];
            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://bigcompany.ghe.com/joebloggs/foobar/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("handles a github.us URL", () => {
            const mockRemotes = [
                "ssh://org@bigcompany.github.us/joebloggs/foobar.git",
            ];

            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://bigcompany.github.us/joebloggs/foobar/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("handles a bitbucket URL", () => {
            const mockRemotes = [
                "https://joebloggs@bitbucket.org/joebloggs/foobar.git",
            ];
            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://bitbucket.org/joebloggs/foobar/src/{gitRevision}/{path}#lines-{line}",
            );
        });

        it("handles a bitbucket SSH URL", () => {
            const mockRemotes = ["git@bitbucket.org:joebloggs/foobar.git"];
            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://bitbucket.org/joebloggs/foobar/src/{gitRevision}/{path}#lines-{line}",
            );
        });

        it("handles a GitLab URL", () => {
            const mockRemotes = ["https://gitlab.com/joebloggs/foobar.git"];
            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://gitlab.com/joebloggs/foobar/-/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("handles a GitLab SSH URL", () => {
            const mockRemotes = ["git@gitlab.com:joebloggs/foobar.git"];
            equal(
                guessSourceUrlTemplate(mockRemotes),
                "https://gitlab.com/joebloggs/foobar/-/blob/{gitRevision}/{path}#L{line}",
            );
        });

        it("Gracefully handles unknown urls", () => {
            const mockRemotes = ["git@example.com"];
            equal(guessSourceUrlTemplate(mockRemotes), undefined);
        });
    });

    describe("getURL", () => {
        using project = tempdirProject();
        afterEach(() => {
            project.rm();
        });

        it("Handles replacements", function () {
            project.addFile("test.js", "console.log('hi!')");
            project.write();

            git(project.cwd, "init", "-b", "test");
            git(project.cwd, "add", ".");
            git(project.cwd, "commit", "-m", "Test commit");
            git(
                project.cwd,
                "remote",
                "add",
                "origin",
                "git@github.com:TypeStrong/typedoc.git",
            );

            const repo = GitRepository.tryCreateRepository(
                project.cwd,
                "{gitRevision}/{gitRevision:short}/{path}/{line}",
                "", // revision, empty to get from repo
                "origin", // remote
                new TestLogger(),
            );

            ok(repo);
            equal(
                repo.getURL(normalizePath(join(project.cwd, "test.js")), 1),
                "b53cc55bcdd9bc5920787a1d4a4a15fa24123b04/b53cc55b/test.js/1",
            );
        });
    });
});

describe("RepositoryManager - no git", () => {});

describe("RepositoryManager - git enabled", () => {
    let fix: Project;
    const logger = new TestLogger();
    const manager = new RepositoryManager(
        "",
        "revision",
        "remote",
        "link:{path}",
        false, // disable git
        logger,
    );

    before(function () {
        function createRepo(path: string) {
            git(path, "init", "-b", "test");
            git(path, "add", ".");
            git(path, "commit", "-m", "Test commit");
        }

        fix = tempdirProject();
        fix.addFile("root.txt");
        fix.addFile(".gitignore", "/ignored");
        fix.addSymlink("self", ".");
        fix.addSymlink("sub", "subfolder");
        fix.dir("subfolder", (dir) => {
            dir.addFile("sub.txt");
        });
        fix.dir("ignored", (dir) => {
            dir.addFile("ignored.txt");
        });
        fix.dir("sub_repo", (dir) => {
            dir.addFile("repo.txt");
        });

        try {
            fix.write();
        } catch (error) {
            if (process.platform === "win32") {
                // Don't have permission to create symlinks
                return this.skip();
            }
            throw error;
        }
        createRepo(join(fix.cwd, "sub_repo"));
        createRepo(fix.cwd);
    });
    after(() => {
        fix.rm();
    });

    afterEach(() => {
        logger.expectNoOtherMessages();
        logger.reset();
    });

    it("Handles the simplest case", () => {
        const root = normalizePath(join(fix.cwd, "root.txt"));
        const repo = manager.getRepository(root) as GitRepository;
        ok(repo);
        equal(repo.getURL(root, 1), "link:root.txt");
        equal(
            repo.files,
            new Set(
                [
                    ".gitignore",
                    "root.txt",
                    "self",
                    "sub",
                    "sub_repo",
                    "subfolder/sub.txt",
                ].map((f) => normalizePath(join(fix.cwd, f))),
            ),
        );
    });

    it("Handles a recursive self-symlink", () => {
        const root = join(fix.cwd, "self/self/self/root.txt");
        const repo = manager.getRepository(root) as GitRepository;
        ok(repo);
        // Ideally, this would probably be link:root.txt, but I'll
        // settle for not crashing right now.
        equal(repo.getURL(root, 1), undefined);
        equal(
            repo.files,
            new Set(
                [
                    ".gitignore",
                    "root.txt",
                    "self",
                    "sub",
                    "sub_repo",
                    "subfolder/sub.txt",
                ].map((f) => normalizePath(join(fix.cwd, f))),
            ),
        );
    });

    it("Handles a nested repository", () => {
        const sub = normalizePath(join(fix.cwd, "sub_repo/repo.txt"));
        const repo = manager.getRepository(sub) as GitRepository;
        ok(repo);
        equal(repo.path, normalizePath(join(fix.cwd, "sub_repo")));
        equal(repo.getURL(sub, 1), "link:repo.txt");
        equal(repo.files.size, 1);
    });

    it("Caches repositories", () => {
        // Load cache
        for (const path of [
            "root.txt",
            "self/self/self/root.txt",
            "sub_repo/repo.txt",
            "ignored/ignored.txt",
            "subfolder/sub.txt",
        ]) {
            manager.getRepository(join(fix.cwd, path));
        }

        const root = join(fix.cwd, "root.txt");
        const rootIndirect = join(fix.cwd, "self/self/self/root.txt");
        const subfolder = join(fix.cwd, "subfolder/sub.txt");
        const repo = manager.getRepository(root) as GitRepository;
        const repo2 = manager.getRepository(rootIndirect) as GitRepository;
        const repo3 = manager.getRepository(subfolder) as GitRepository;
        ok(repo === repo2);
        ok(repo === repo3);

        const sub = join(fix.cwd, "sub_repo/repo.txt");
        const subRepo = manager.getRepository(sub) as GitRepository;
        const subRepo2 = manager.getRepository(sub) as GitRepository;
        ok(subRepo === subRepo2);

        equal(
            manager["cache"],
            new Map([
                [normalizePath(fix.cwd), repo],
                [normalizePath(join(fix.cwd, "self/self/self")), repo],
                [normalizePath(join(fix.cwd, "sub_repo")), subRepo],
                [normalizePath(join(fix.cwd, "ignored")), repo],
                [normalizePath(join(fix.cwd, "subfolder")), repo],
            ]),
        );
    });

    it("Handles .gitignored paths", () => {
        const ign = join(fix.cwd, "ignored/ignored.txt");
        const repo = manager.getRepository(ign);
        equal(repo?.path, normalizePath(fix.cwd));
        equal(repo.getURL(ign, 1), undefined);
    });
});
