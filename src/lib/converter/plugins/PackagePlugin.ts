import * as Path from "path";

import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { Option, EntryPointStrategy, readFile } from "../../utils";
import {
    deriveRootDir,
    discoverInParentDir,
    discoverPackageJson,
} from "../../utils/fs";
import { nicePath } from "../../utils/paths";
import { MinimalSourceFile } from "../../utils/minimalSourceFile";
import type { ProjectReflection } from "../../models/index";
import { ApplicationEvents } from "../../application-events";
import { join } from "path";

/**
 * A handler that tries to find the package.json and readme.md files of the
 * current project.
 */
@Component({ name: "package" })
export class PackagePlugin extends ConverterComponent {
    @Option("readme")
    accessor readme!: string;

    @Option("entryPointStrategy")
    accessor entryPointStrategy!: EntryPointStrategy;

    @Option("entryPoints")
    accessor entryPoints!: string[];

    @Option("includeVersion")
    accessor includeVersion!: boolean;

    /**
     * The file name of the found readme.md file.
     */
    private readmeFile?: string;

    /**
     * Contents of the readme.md file discovered, if any
     */
    private readmeContents?: string;

    /**
     * Contents of package.json for the active project
     */
    private packageJson?: { name: string; version?: string };

    override initialize() {
        this.owner.on(Converter.EVENT_BEGIN, this.onBegin.bind(this));
        this.owner.on(
            Converter.EVENT_RESOLVE_BEGIN,
            this.onBeginResolve.bind(this),
        );
        this.owner.on(Converter.EVENT_END, () => {
            delete this.readmeFile;
            delete this.readmeContents;
            delete this.packageJson;
        });
        this.application.on(ApplicationEvents.REVIVE, this.onRevive.bind(this));
    }

    private onRevive(project: ProjectReflection) {
        this.onBegin();
        this.addEntries(project);
        delete this.readmeFile;
        delete this.packageJson;
        delete this.readmeContents;
    }

    private onBegin() {
        this.readmeFile = undefined;
        this.readmeContents = undefined;
        this.packageJson = undefined;

        const entryFiles =
            this.entryPointStrategy === EntryPointStrategy.Packages
                ? this.entryPoints.map((d) => join(d, "package.json"))
                : this.entryPoints;

        const dirName =
            this.application.options.packageDir ??
            Path.resolve(deriveRootDir(entryFiles));

        this.application.logger.verbose(
            `Begin readme.md/package.json search at ${nicePath(dirName)}`,
        );

        this.packageJson = discoverPackageJson(dirName)?.content;

        // Path will be resolved already. This is kind of ugly, but...
        if (this.readme.endsWith("none")) {
            return; // No readme, we're done
        }

        if (this.readme) {
            // Readme path provided, read only that file.
            try {
                this.readmeContents = readFile(this.readme);
                this.readmeFile = this.readme;
            } catch {
                this.application.logger.error(
                    this.application.i18n.provided_readme_at_0_could_not_be_read(
                        nicePath(this.readme),
                    ),
                );
            }
        } else {
            // No readme provided, automatically find the readme
            const result = discoverInParentDir(
                "readme.md",
                dirName,
                (content) => content,
            );

            if (result) {
                this.readmeFile = result.file;
                this.readmeContents = result.content;
            }
        }
    }

    private onBeginResolve(context: Context) {
        this.addEntries(context.project);
    }

    private addEntries(project: ProjectReflection) {
        if (this.readmeFile && this.readmeContents) {
            const { content } = this.application.converter.parseRawComment(
                new MinimalSourceFile(this.readmeContents, this.readmeFile),
                project.files,
            );

            project.readme = content;
        }

        if (this.packageJson) {
            project.packageName = this.packageJson.name;
            if (!project.name) {
                project.name = project.packageName || "Documentation";
            }
            if (this.includeVersion) {
                project.packageVersion = this.packageJson.version?.replace(
                    /^v/,
                    "",
                );
            }
        } else if (!project.name) {
            this.application.logger.warn(
                this.application.i18n.defaulting_project_name(),
            );
            project.name = "Documentation";
        }
    }
}
