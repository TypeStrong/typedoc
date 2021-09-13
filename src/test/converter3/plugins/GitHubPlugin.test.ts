import * as github from "../../../lib/converter/plugins/GitHubPlugin";
import Assert = require("assert");

describe("Repository", function () {
    describe("constructor", function () {
        it("defaults to github.com hostname", function () {
            const repository = new github.Repository("", "", []);

            Assert.equal(repository.hostname, "github.com");
        });

        it("handles a personal GitHub HTTPS URL", function () {
            const mockRemotes = ["https://github.com/joebloggs/foobar.git"];

            const repository = new github.Repository("", "", mockRemotes);

            Assert.equal(repository.hostname, "github.com");
            Assert.equal(repository.user, "joebloggs");
            Assert.equal(repository.project, "foobar");
        });

        it("handles an enterprise GitHub URL", function () {
            const mockRemotes = ["git@github.acme.com:joebloggs/foobar.git"];

            const repository = new github.Repository("", "", mockRemotes);

            Assert.equal(repository.hostname, "github.acme.com");
            Assert.equal(repository.user, "joebloggs");
            Assert.equal(repository.project, "foobar");
        });

        it("handles a Bitbucket HTTPS URL", function () {
            const mockRemotes = [
                "https://joebloggs@bitbucket.org/joebloggs/foobar.git",
            ];

            const repository = new github.Repository("", "", mockRemotes);

            Assert.equal(repository.hostname, "bitbucket.org");
            Assert.equal(repository.user, "joebloggs");
            Assert.equal(repository.project, "foobar");
        });

        it("handles a Bitbucket SSH URL", function () {
            const mockRemotes = ["git@bitbucket.org:joebloggs/foobar.git"];

            const repository = new github.Repository("", "", mockRemotes);

            Assert.equal(repository.hostname, "bitbucket.org");
            Assert.equal(repository.user, "joebloggs");
            Assert.equal(repository.project, "foobar");
        });
    });
});
