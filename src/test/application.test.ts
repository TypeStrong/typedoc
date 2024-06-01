import { equal } from "assert";
import { createAppForTesting } from "../lib/application";
import { ProjectReflection } from "../lib/models";
import { TestLogger } from "./TestLogger";

const fakeProject: ProjectReflection = {} as any;

describe("Application", function () {

    describe("generateDocs", () => {
        it("should not warn if no warnings or errors", async function () {
            const logger = new TestLogger();
            const app = createAppForTesting();
            app.logger = logger;
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.warningCount, 0);
            equal(logger.errorCount, 0);
        });

        it("should warn if 1 warning", async function () {
            const logger = new TestLogger();
            const app = createAppForTesting();
            app.logger = logger;
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.warn("render");
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.warningCount, 2); // 1 original warning + 1 warning about the warning
            logger.expectMessage(
                'warn: Found: 0 errors, 1 warning.',
            );
        });

        it("should warn if multiple warnings", async function () {
            const logger = new TestLogger();
            const app = createAppForTesting();
            app.logger = logger;
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.warn("render 1");
                logger.warn("render 2"); // count is not incremented if the same warning is logged multiple times!
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.warningCount, 3); // 2 original warnings + 1 warning about the warnings
            logger.expectMessage(
                'warn: Found: 0 errors, 2 warnings.',
            );
        });

        it("should error if 1 error", async function () {
            const logger = new TestLogger();
            const app = createAppForTesting();
            app.logger = logger;
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.error("render");
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.errorCount, 3); // 1 original error + 1 error about the error + 1 "Documentation could not be generated" error
            equal(logger.warningCount, 0);
            logger.expectMessage(
                'error: Found: 1 error, 0 warnings.',
            );
        });

        it("should error if multiple errors", async function () {
            const logger = new TestLogger();
            const app = createAppForTesting();
            app.logger = logger;
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.error("render 1");
                logger.error("render 2"); // count is not incremented if the same error is logged multiple times!
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.errorCount, 4); // 2 original errors + 1 error about the errors + 1 "Documentation could not be generated" error
            equal(logger.warningCount, 0);
            logger.expectMessage(
                'error: Found: 2 errors, 0 warnings.',
            );
        });

        it("should error if 1 error and 1 warning", async function () {
            const logger = new TestLogger();
            const app = createAppForTesting();
            app.logger = logger;
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.error("render");
                logger.warn("render");
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.errorCount, 3); // 1 original error + 1 error about the error + 1 "Documentation could not be generated" error
            equal(logger.warningCount, 1);
            logger.expectMessage(
                'error: Found: 1 error, 1 warning.',
            );
        });

        it("should error if multiple errors and warnings", async function () {
            const logger = new TestLogger();
            const app = createAppForTesting();
            app.logger = logger;
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.error("render 1");
                logger.error("render 2");
                logger.warn("render 1");
                logger.warn("render 2"); // count is not incremented if the same warning is logged multiple times!
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.errorCount, 4); // 2 original errors + 1 error about the errors + 1 "Documentation could not be generated" error
            equal(logger.warningCount, 2); // 2 original warnings
            logger.expectMessage(
                'error: Found: 2 errors, 2 warnings.',
            );
        });
    });
});