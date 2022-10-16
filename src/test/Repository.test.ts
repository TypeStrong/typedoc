import { guessBaseUrl } from "../lib/converter/utils/repository";
import { strictEqual as equal } from "assert";

describe("Repository", function () {
    describe("guessBaseUrl helper", () => {
        it("handles a personal GitHub HTTPS URL", () => {
            const mockRemotes = ["https://github.com/joebloggs/foobar.git"];

            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://github.com/joebloggs/foobar/blob/rev"
            );
        });

        it("handles a personal GitHub SSH URL", () => {
            const mockRemotes = ["git@github.com:TypeStrong/typedoc.git"];

            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://github.com/TypeStrong/typedoc/blob/rev"
            );
        });

        it("handles an enterprise GitHub URL", () => {
            const mockRemotes = ["git@github.acme.com:joebloggs/foobar.git"];
            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://github.acme.com/joebloggs/foobar/blob/rev"
            );
        });

        it("handles an enterprise GitHub URL", () => {
            const mockRemotes = [
                "ssh://org@bigcompany.githubprivate.com/joebloggs/foobar.git",
            ];
            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://bigcompany.githubprivate.com/joebloggs/foobar/blob/rev"
            );
        });

        it("handles a ghe.com URL", () => {
            const mockRemotes = [
                "ssh://org@bigcompany.ghe.com/joebloggs/foobar.git",
            ];
            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://bigcompany.ghe.com/joebloggs/foobar/blob/rev"
            );
        });

        it("handles a github.us URL", () => {
            const mockRemotes = [
                "ssh://org@bigcompany.github.us/joebloggs/foobar.git",
            ];

            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://bigcompany.github.us/joebloggs/foobar/blob/rev"
            );
        });

        it("handles a bitbucket URL", () => {
            const mockRemotes = [
                "https://joebloggs@bitbucket.org/joebloggs/foobar.git",
            ];
            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://bitbucket.org/joebloggs/foobar/src/rev"
            );
        });

        it("handles a bitbucket SSH URL", () => {
            const mockRemotes = ["git@bitbucket.org:joebloggs/foobar.git"];
            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://bitbucket.org/joebloggs/foobar/src/rev"
            );
        });

        it("handles a GitLab URL", () => {
            const mockRemotes = ["https://gitlab.com/joebloggs/foobar.git"];
            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://gitlab.com/joebloggs/foobar/-/blob/rev"
            );
        });

        it("handles a GitLab SSH URL", () => {
            const mockRemotes = ["git@gitlab.com:joebloggs/foobar.git"];
            equal(
                guessBaseUrl("rev", mockRemotes),
                "https://gitlab.com/joebloggs/foobar/-/blob/rev"
            );
        });

        it("Gracefully handles unknown urls", () => {
            const mockRemotes = ["git@example.com"];
            equal(guessBaseUrl("rev", mockRemotes), undefined);
        });
    });
});
