import {
    GitRepository,
    guessSourceUrlTemplate,
    RepositoryManager,
} from "../lib/converter/utils/repository";
import { strictEqual as equal, ok } from "assert";
import { tempdirProject } from "@typestrong/fs-fixture-builder";
import { spawnSync } from "child_process";
import { TestLogger } from "./TestLogger";
import { join } from "path";
import { normalizePath } from "../lib/utils/paths";

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
        const project = tempdirProject();
        function git(...args: string[]) {
            const env = {
                GIT_AUTHOR_NAME: "test",
                GIT_AUTHOR_EMAIL: "test@example.com",
                GIT_AUTHOR_DATE: "2024-03-31T22:04:50.119Z",
                GIT_COMMITTER_NAME: "test",
                GIT_COMMITTER_EMAIL: "test@example.com",
                GIT_COMMITTER_DATE: "2024-03-31T22:04:50.119Z",
            };
            return spawnSync("git", ["-C", project.cwd, ...args], {
                encoding: "utf-8",
                windowsHide: true,
                env,
            });
        }

        afterEach(() => {
            project.rm();
        });

        it("Handles replacements", function () {
            project.addFile("test.js", "console.log('hi!')");
            project.write();

            git("init", "-b", "test");
            git("add", ".");
            git("commit", "-m", "Test commit");
            git(
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

describe("RepositoryManager", () => {
    const logger = new TestLogger();
    let manager: RepositoryManager;

    beforeEach(() => {
        manager = new RepositoryManager(
            "",
            "revision",
            "remote",
            "{path}:{line}",
            false,
            logger,
        );
    });

    it("Does not return a repository if the directory has already been checked", () => {
        manager.ignoredPaths.add("/test");
        equal(manager.getRepository("/test/test.js"), undefined);
    });

    it("Uses the existing repository if one exists");
});
