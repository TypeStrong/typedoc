import * as github from "../lib/converter/plugins/GitHubPlugin";
import Assert = require("assert");

describe("GitHubRepository", function () {
    describe("constructor", function () {
        it("must default to github.com hostname", function () {
            const repository = new github.Repository("", "", []);

            Assert.equal(repository.gitHubHostname, "github.com");
        });

        it("must correctly handle an enterprise github URL hostname", function () {
            const mockRemotes = ["git@github.acme.com:joebloggs/foobar.git"];

            const repository = new github.Repository("", "", mockRemotes);

            Assert.equal(repository.gitHubHostname, "github.acme.com");
        });
    });
});
