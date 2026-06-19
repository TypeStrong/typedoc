import { GitRepository, guessSourceUrlTemplate, RepositoryManager } from "../lib/converter/utils/repository.js";
import { deepStrictEqual as equal, ok } from "assert";
import { type Project, tempdirProject } from "./fs-fixture-builder.js";
import { spawn } from "child_process";
import { TestLogger } from "./TestLogger.js";
import { dirname, join } from "path";
import { normalizePath } from "../lib/utils/paths.js";
import { unique } from "#utils";

async function git(cwd: string, ...args: string[]) {
    const env = {
        GIT_AUTHOR_NAME: "test",
        GIT_AUTHOR_EMAIL: "test@example.com",
        GIT_AUTHOR_DATE: "2024-03-31T22:04:50.119Z",
        GIT_COMMITTER_NAME: "test",
        GIT_COMMITTER_EMAIL: "test@example.com",
        GIT_COMMITTER_DATE: "2024-03-31T22:04:50.119Z",
    };

    await new Promise(resolve => {
        const child = spawn("git", ["-C", cwd, ...args], {
            windowsHide: true,
            env,
        });
        child.once("error", resolve);
        child.once("close", resolve);
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

        it("Handles replacements", async function () {
            project.addFile("test.js", "console.log('hi!')");
            project.write();

            await git(project.cwd, "init", "-b", "test");
            await git(project.cwd, "add", ".");
            await git(project.cwd, "commit", "-m", "Test commit", "--no-gpg-sign");
            await git(
                project.cwd,
                "remote",
                "add",
                "origin",
                "git@github.com:TypeStrong/typedoc.git",
            );

            const repo = await GitRepository.tryCreateRepository(
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

            const repo2 = await GitRepository.tryCreateRepository(
                project.cwd,
                "{gitRevision}/{gitRevision:short}/{path}/{line}",
                "{branch}", // revision
                "origin", // remote
                new TestLogger(),
            );

            equal(repo2?.gitRevision, "test");
        });
    });
});

describe("GitRepository.tryCreateRepositoryAsync", () => {
    let fix: Project;

    beforeEach(async () => {
        fix = tempdirProject();
        fix.addFile("file.ts", "export const x = 1;\n");
        fix.write();
        await git(fix.cwd, "init");
        await git(fix.cwd, "remote", "add", "origin", "https://github.com/TypeStrong/typedoc.git");
        await git(fix.cwd, "add", ".");
        await git(fix.cwd, "commit", "-m", "init");
    });

    afterEach(() => fix.rm());

    it("returns a GitRepository with revision, url template, and files set", async () => {
        const repo = await GitRepository.tryCreateRepository(
            normalizePath(fix.cwd),
            "",
            "",
            "origin",
            new TestLogger(),
        );
        ok(repo);
        equal(repo.urlTemplate.startsWith("https://github.com/TypeStrong/typedoc/blob/"), true);
        ok(repo.gitRevision.length === 40);
        equal(repo.files.has(normalizePath(fix.cwd + "/file.ts")), true);
    });

    it("uses an explicit sourceLinkTemplate when one is provided", async () => {
        const repo = await GitRepository.tryCreateRepository(
            normalizePath(fix.cwd),
            "https://example.com/{path}#L{line}",
            "",
            "origin",
            new TestLogger(),
        );
        ok(repo);
        equal(repo.urlTemplate, "https://example.com/{path}#L{line}");
    });

    it("passes through a literal gitRevision without invoking rev-parse", async () => {
        const literalSha = "0".repeat(40);
        const repo = await GitRepository.tryCreateRepository(
            normalizePath(fix.cwd),
            "",
            literalSha,
            "origin",
            new TestLogger(),
        );
        ok(repo);
        equal(repo.gitRevision, literalSha);
    });

    it("returns undefined for a repo with no commits", async () => {
        const empty = tempdirProject();
        empty.write();
        await git(empty.cwd, "init");
        // Intentionally no commit — HEAD will resolve to "HEAD" literal.
        const repo = await GitRepository.tryCreateRepository(
            normalizePath(empty.cwd),
            "https://example.com/{path}#L{line}",
            "",
            "origin",
            new TestLogger(),
        );
        equal(repo, undefined);
        empty.rm();
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

    before(async function () {
        async function createRepo(path: string) {
            await git(path, "init", "-b", "test");
            await git(path, "add", ".");
            await git(path, "commit", "-m", "Test commit", "--no-gpg-sign");
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
        await createRepo(join(fix.cwd, "sub_repo"));
        await createRepo(fix.cwd);
        await manager.initializeRepositoriesForDirs([
            fix.cwd,
            join(fix.cwd, "subfolder"),
            join(fix.cwd, "ignored"),
            join(fix.cwd, "sub_repo"),
        ]);
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
        const repo = manager.getRepository(root);
        ok(repo instanceof GitRepository);
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
        const root = normalizePath(join(fix.cwd, "self/self/self/root.txt"));
        const repo = manager.getRepository(root);
        ok(repo instanceof GitRepository);
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
        const repo = manager.getRepository(sub);
        ok(repo instanceof GitRepository);
        equal(repo.path, normalizePath(join(fix.cwd, "sub_repo")));
        equal(repo.getURL(sub, 1), "link:repo.txt");
        equal(repo.files.size, 1);
    });

    it("Caches repositories", async () => {
        // Load cache
        const manager = new RepositoryManager(
            "",
            "revision",
            "remote",
            "link:{path}",
            false, // disable git
            logger,
        );
        const dirs = unique(fix.files.map(file => dirname(file.path)));
        await manager.initializeRepositoriesForDirs(dirs);

        const root = normalizePath(join(fix.cwd, "root.txt"));
        const rootIndirect = normalizePath(join(fix.cwd, "self/self/self/root.txt"));
        const subfolder = normalizePath(join(fix.cwd, "subfolder/sub.txt"));
        const repo = manager.getRepository(root) as GitRepository;
        const repo2 = manager.getRepository(rootIndirect) as GitRepository;
        const repo3 = manager.getRepository(subfolder) as GitRepository;
        ok(repo === repo2);
        ok(repo === repo3);

        const sub = normalizePath(join(fix.cwd, "sub_repo/repo.txt"));
        const subRepo = manager.getRepository(sub) as GitRepository;
        const subRepo2 = manager.getRepository(sub) as GitRepository;
        ok(subRepo === subRepo2);

        equal(
            manager["repositories"],
            new Map([
                [normalizePath(fix.cwd), repo],
                [normalizePath(join(fix.cwd, "sub_repo")), subRepo],
                [normalizePath(join(fix.cwd, "self/self/self")), repo],
                [normalizePath(join(fix.cwd, "subfolder")), repo],
            ]),
        );
    });

    it("Handles .gitignored paths", () => {
        const ign = normalizePath(join(fix.cwd, "ignored/ignored.txt"));
        const repo = manager.getRepository(ign);
        equal(repo?.path, normalizePath(fix.cwd));
        equal(repo.getURL(ign, 1), undefined);
    });
});

describe("RepositoryManager - edge cases", () => {
    let fix: Project;
    const logger = new TestLogger();
    const manager = new RepositoryManager(
        "",
        "",
        "remote",
        "",
        false, // disable git
        logger,
    );

    beforeEach(() => {
        fix = tempdirProject();
    });

    afterEach(() => {
        fix.rm();
        logger.expectNoOtherMessages();
    });

    it("Handles repositories without any commit", async () => {
        fix.write();
        await git(fix.cwd, "init", "-b", "test");
        await manager.initializeRepositoriesForDirs([fix.cwd]);
        equal(manager.getRepository(normalizePath(fix.cwd + "/test.txt")), undefined);
    });

    it("Handles a remote which does not exist", async () => {
        fix.addFile("test.txt");
        fix.write();
        await git(fix.cwd, "init", "-b", "test");
        await git(fix.cwd, "add", ".");
        await git(fix.cwd, "commit", "-m", "test", "--no-gpg-sign");
        await manager.initializeRepositoriesForDirs([fix.cwd]);
        equal(manager.getRepository(normalizePath(fix.cwd + "/test.txt")), undefined);
        logger.expectMessage('warn: The provided git remote "remote" was not valid. Source links will be broken');
    });

    it("Handles a remote which does not match a known domain", async () => {
        fix.addFile("test.txt");
        fix.write();
        await git(fix.cwd, "init", "-b", "test");
        await git(fix.cwd, "add", ".");
        await git(fix.cwd, "commit", "-m", "test", "--no-gpg-sign");
        await git(fix.cwd, "remote", "add", "remote", "https://example.com/fake.git");
        await manager.initializeRepositoriesForDirs([fix.cwd]);
        equal(manager.getRepository(normalizePath(fix.cwd + "/test.txt")), undefined);
    });
});
