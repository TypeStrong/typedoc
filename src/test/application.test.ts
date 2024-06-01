import { equal } from "assert";
import { promises as fsp } from "fs";
import { type Application, createAppForTesting } from "../lib/application";
import type { ProjectReflection } from "../lib/models";
import { TestLogger } from "./TestLogger";
import type { ModelToObject } from "../lib/serialization/schema";

const fakeProject: ProjectReflection = {} as any;

const repeat = (n: number, callback: (i: number) => void): void => {
    for (let i = 0; i < n; i++) {
      callback(i);
    }
};

const createProjectToObject = (
    logger: TestLogger,
    warnings: number,
    errors: number,
) => (
    _value: ProjectReflection,
    _projectRoot: string,
): ModelToObject<ProjectReflection> => {
    repeat(warnings, (i: number) => logger.warn(`test warning ${i}`));
    repeat(errors, (i: number) => logger.error(`test error ${i}`));
    return {} as any;
};


describe("Application", function () {

    describe("generateDocs - errors and warnings summary", () => {
        const app: Application = createAppForTesting();
        const logger: TestLogger = new TestLogger();
        app.logger = logger;

        afterEach(() => {
            logger.reset();
        });

        it("should not warn if no warnings or errors", async function () {
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
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.warn("render");
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.warningCount, 2); // 1 original warning + 1 warning about the warning
            logger.expectMessage('warn: Found: 0 errors, 1 warning.');
        });

        it("should warn if multiple warnings", async function () {
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.warn("render 1");
                logger.warn("render 2"); // count is not incremented if the same warning is logged multiple times!
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.warningCount, 3); // 2 original warnings + 1 warning about the warnings
            logger.expectMessage('warn: Found: 0 errors, 2 warnings.');
        });

        it("should error if 1 error", async function () {
            app.renderer.render = () => {
                logger.info("testing");
                logger.verbose("render");
                logger.error("render");
                return Promise.resolve();
            }
            await app.generateDocs(fakeProject, '');
            equal(logger.errorCount, 3); // 1 original error + 1 error about the error + 1 "Documentation could not be generated" error
            equal(logger.warningCount, 0);
            logger.expectMessage('error: Found: 1 error, 0 warnings.');
        });

        it("should error if multiple errors", async function () {
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
            logger.expectMessage('error: Found: 2 errors, 0 warnings.');
        });

        it("should error if 1 error and 1 warning", async function () {
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
            logger.expectMessage('error: Found: 1 error, 1 warning.');
        });

        it("should error if multiple errors and warnings", async function () {
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
            logger.expectMessage('error: Found: 2 errors, 2 warnings.');
        });
    });

    describe("generateJson - errors and warnings details", () => {
        const originalFsWriteFile = fsp.writeFile;
        const originalMkdir = fsp.mkdir;

        fsp.writeFile = (_path, _data) => Promise.resolve();
        fsp.mkdir = (_path, _options) => Promise.resolve(undefined);
        
        const app: Application = createAppForTesting();
        const logger: TestLogger = new TestLogger();
        app.logger = logger;

        afterEach(() => {
            logger.reset();
        });

        after(() => {
            fsp.writeFile = originalFsWriteFile;
            fsp.mkdir = originalMkdir;
        });

        it("should not warn if no warnings or errors", async function () {
            app.serializer.projectToObject = createProjectToObject(logger, 0, 0);
            await app.generateJson(fakeProject, '');
            equal(logger.warningCount, 0);
            equal(logger.errorCount, 0);
        });

        it("should warn if 1 warning", async function () {
            app.serializer.projectToObject = createProjectToObject(logger, 1, 0);
            await app.generateJson(fakeProject, '');
            equal(logger.warningCount, 2);
            equal(logger.errorCount, 0);
            logger.expectMessage('warn: Found: 0 errors, 1 warning.');
        });

        it("should warn if multiple warnings", async function () {
            app.serializer.projectToObject = createProjectToObject(logger, 10, 0);
            await app.generateJson(fakeProject, '');
            equal(logger.warningCount, 11); // 10 original warnings + 1 warning about the warnings
            equal(logger.errorCount, 0);
            logger.expectMessage('warn: Found: 0 errors, 10 warnings.');
        });

        it("should error if 1 error", async function () {
            app.serializer.projectToObject = createProjectToObject(logger, 0, 1);
            await app.generateJson(fakeProject, '');
            equal(logger.errorCount, 2); // 1 original error + 1 error about the error
            equal(logger.warningCount, 0);
            logger.expectMessage('error: Found: 1 error, 0 warnings.');
        });

        it("should error if multiple errors", async function () {
            app.serializer.projectToObject = createProjectToObject(logger, 0, 10);
            await app.generateJson(fakeProject, '');
            equal(logger.errorCount, 11); // 10 original errors + 1 error about the errors
            equal(logger.warningCount, 0);
            logger.expectMessage('error: Found: 10 errors, 0 warnings.');
        });

        it("should error if 1 error and 1 warning", async function () {
            app.serializer.projectToObject = createProjectToObject(logger, 1, 1);
            await app.generateJson(fakeProject, '');
            equal(logger.errorCount, 2); // 1 original error + 1 error about the error
            equal(logger.warningCount, 1);
            logger.expectMessage('error: Found: 1 error, 1 warning.');
        });

        it("should error if multiple errors and warnings", async function () {
            app.serializer.projectToObject = createProjectToObject(logger, 10, 10);
            await app.generateJson(fakeProject, '');
            equal(logger.errorCount, 11); // 10 original errors + 1 error about the errors
            equal(logger.warningCount, 10); // 10 original warnings
            logger.expectMessage('error: Found: 10 errors, 10 warnings.');
        });
    });
});
