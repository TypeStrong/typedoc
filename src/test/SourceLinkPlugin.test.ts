import { Repository } from "../lib/converter/plugins/SourceLinkPlugin";
import { RepositoryType } from "../lib/models";
import { strictEqual as equal } from "assert";

describe("Repository", function () {
    describe("constructor", function () {
        it("defaults to github.com hostname", function () {
            const repository = new Repository("", "", []);

            equal(repository.hostname, "github.com");
            equal(repository.type, RepositoryType.GitHub);
        });

        it("handles a personal GitHub HTTPS URL", function () {
            const mockRemotes = ["https://github.com/joebloggs/foobar.git"];

            const repository = new Repository("", "", mockRemotes);

            equal(repository.hostname, "github.com");
            equal(repository.user, "joebloggs");
            equal(repository.project, "foobar");
            equal(repository.type, RepositoryType.GitHub);
        });

        it("handles an enterprise GitHub URL", function () {
            const mockRemotes = ["git@github.acme.com:joebloggs/foobar.git"];

            const repository = new Repository("", "", mockRemotes);

            equal(repository.hostname, "github.acme.com");
            equal(repository.user, "joebloggs");
            equal(repository.project, "foobar");
            equal(repository.type, RepositoryType.GitHub);
        });

        it("handles a githubprivate.com URL", function () {
            const mockRemotes = [
                "ssh://org@bigcompany.githubprivate.com/joebloggs/foobar.git",
            ];

            const repository = new Repository("", "", mockRemotes);

            equal(repository.hostname, "bigcompany.githubprivate.com");
            equal(repository.user, "joebloggs");
            equal(repository.project, "foobar");
            equal(repository.type, RepositoryType.GitHub);
        });

        it("handles a Bitbucket HTTPS URL", function () {
            const mockRemotes = [
                "https://joebloggs@bitbucket.org/joebloggs/foobar.git",
            ];

            const repository = new Repository("", "", mockRemotes);

            equal(repository.hostname, "bitbucket.org");
            equal(repository.user, "joebloggs");
            equal(repository.project, "foobar");
            equal(repository.type, RepositoryType.Bitbucket);
        });

        it("handles a Bitbucket SSH URL", function () {
            const mockRemotes = ["git@bitbucket.org:joebloggs/foobar.git"];

            const repository = new Repository("", "", mockRemotes);

            equal(repository.hostname, "bitbucket.org");
            equal(repository.user, "joebloggs");
            equal(repository.project, "foobar");
            equal(repository.type, RepositoryType.Bitbucket);
        });

        it("handles a GitLab HTTPS URL", function () {
            const mockRemotes = ["https://gitlab.com/joebloggs/foobar.git"];

            const repository = new Repository("", "", mockRemotes);

            equal(repository.hostname, "gitlab.com");
            equal(repository.user, "joebloggs");
            equal(repository.project, "foobar");
            equal(repository.type, RepositoryType.GitLab);
        });

        it("handles a GitLab SSH URL", function () {
            const mockRemotes = ["git@gitlab.com:joebloggs/foobar.git"];

            const repository = new Repository("", "", mockRemotes);

            equal(repository.hostname, "gitlab.com");
            equal(repository.user, "joebloggs");
            equal(repository.project, "foobar");
            equal(repository.type, RepositoryType.GitLab);
        });
    });

    describe("getURL", () => {
        const repositoryPath = "C:/Projects/foobar";
        const filePath = repositoryPath + "/src/index.ts";

        it("returns a GitHub URL", function () {
            const mockRemotes = ["https://github.com/joebloggs/foobar.git"];

            const repository = new Repository(
                repositoryPath,
                "main",
                mockRemotes
            );
            repository.files = [filePath];

            equal(
                repository.getURL(filePath),
                "https://github.com/joebloggs/foobar/blob/main/src/index.ts"
            );
        });

        it("returns a Bitbucket URL", function () {
            const mockRemotes = [
                "https://joebloggs@bitbucket.org/joebloggs/foobar.git",
            ];

            const repository = new Repository(
                repositoryPath,
                "main",
                mockRemotes
            );
            repository.files = [filePath];

            equal(
                repository.getURL(filePath),
                "https://bitbucket.org/joebloggs/foobar/src/main/src/index.ts"
            );
        });

        it("returns a GitLab URL", function () {
            const mockRemotes = ["https://gitlab.com/joebloggs/foobar.git"];

            const repository = new Repository(
                repositoryPath,
                "main",
                mockRemotes
            );
            repository.files = [filePath];

            equal(
                repository.getURL(filePath),
                "https://gitlab.com/joebloggs/foobar/-/blob/main/src/index.ts"
            );
        });
    });
});
