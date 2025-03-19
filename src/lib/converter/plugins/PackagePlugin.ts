import * as Path from "path";

import { ConverterComponent } from "../components.js";
import type { Context } from "../context.js";
import type { ProjectReflection } from "../../models/index.js";
import { ApplicationEvents } from "../../application-events.js";
import { ConverterEvents } from "../converter-events.js";
import type { Converter } from "../converter.js";
import { type GlobString, i18n, MinimalSourceFile, type NormalizedPath } from "#utils";
import {
    discoverPackageJson,
    type EntryPointStrategy,
    getCommonDirectory,
    nicePath,
    normalizePath,
    Option,
} from "#node-utils";
import { existsSync } from "fs";

/**
 * A handler that tries to find the package.json and readme.md files of the
 * current project.
 */
export class PackagePlugin extends ConverterComponent {
    @Option("readme")
    accessor readme!: string;

    @Option("entryPointStrategy")
    accessor entryPointStrategy!: EntryPointStrategy;

    @Option("entryPoints")
    accessor entryPoints!: GlobString[];

    @Option("includeVersion")
    accessor includeVersion!: boolean;

    /**
     * The file name of the found readme.md file.
     */
    private readmeFile?: NormalizedPath;

    /**
     * Contents of the readme.md file discovered, if any
     */
    private readmeContents?: string;

    /**
     * Contents of package.json for the active project
     */
    private packageJson?: { name: string; version?: string };

    constructor(owner: Converter) {
        super(owner);
        this.owner.on(ConverterEvents.BEGIN, this.onBegin.bind(this));
        this.owner.on(
            ConverterEvents.RESOLVE_BEGIN,
            this.onBeginResolve.bind(this),
        );
        this.owner.on(ConverterEvents.END, () => {
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

        const dirName = this.application.options.packageDir ??
            Path.resolve(getCommonDirectory(this.entryPoints.map(g => `${g}/`)));

        this.application.logger.verbose(
            `Begin package.json search at ${nicePath(dirName)}`,
        );

        const fs = this.application.fs;
        const packageJson = discoverPackageJson(dirName, fs);
        this.packageJson = packageJson?.content;

        // Path will be resolved already. This is kind of ugly, but...
        if (this.readme.endsWith("none")) {
            return; // No readme, we're done
        }

        if (this.readme) {
            // Readme path provided, read only that file.
            this.application.watchFile(this.readme);
            try {
                this.readmeContents = fs.readFile(this.readme);
                this.readmeFile = normalizePath(this.readme);
            } catch {
                this.application.logger.error(
                    i18n.provided_readme_at_0_could_not_be_read(
                        nicePath(this.readme),
                    ),
                );
            }
        } else if (packageJson) {
            // No readme provided, automatically find the readme
            const possibleReadmePaths = [
                "README.md",
                "readme.md",
                "Readme.md",
            ].map(name => Path.join(Path.dirname(packageJson.file), name));

            const readmePath = possibleReadmePaths.find(path => {
                this.application.watchFile(path);
                return existsSync(path);
            });

            if (readmePath) {
                this.readmeFile = normalizePath(readmePath);
                this.readmeContents = fs.readFile(readmePath);
                this.application.watchFile(this.readmeFile);
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

            // This isn't ideal, but seems better than figuring out the readme
            // path over in the include plugin...
            this.owner.includePlugin.checkIncludeTagsParts(
                project,
                Path.dirname(this.readmeFile),
                content,
            );
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
                i18n.defaulting_project_name(),
            );
            project.name = "Documentation";
        }
    }
}
