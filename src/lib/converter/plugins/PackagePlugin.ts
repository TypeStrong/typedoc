import * as Path from "path";
import * as FS from "fs";

import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { BindOption, EntryPointStrategy, readFile } from "../../utils";
import { getCommonDirectory } from "../../utils/fs";
import { nicePath } from "../../utils/paths";
import { MinimalSourceFile } from "../../utils/minimalSourceFile";
import type { ProjectReflection } from "../../models/index";
import { ApplicationEvents } from "../../application-events";
import { optional, validate } from "../../utils/validation";

/**
 * A handler that tries to find the package.json and readme.md files of the
 * current project.
 */
@Component({ name: "package" })
export class PackagePlugin extends ConverterComponent {
    @BindOption("readme")
    readme!: string;

    @BindOption("entryPointStrategy")
    entryPointStrategy!: EntryPointStrategy;

    /**
     * The file name of the found readme.md file.
     */
    private readmeFile?: string;

    /**
     * Contents of package.json for the active project
     */
    private packageJson?: { name: string; version?: string };

    override initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_BEGIN]: this.onBegin,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
            [Converter.EVENT_END]: () => {
                delete this.readmeFile;
                delete this.packageJson;
            },
        });
        this.listenTo(this.application, {
            [ApplicationEvents.REVIVE]: this.onRevive,
        });
    }

    private onRevive(project: ProjectReflection) {
        this.onBegin();
        this.addEntries(project);
        delete this.readmeFile;
        delete this.packageJson;
    }

    private onBegin() {
        this.readmeFile = undefined;
        this.packageJson = undefined;

        // Path will be resolved already. This is kind of ugly, but...
        const noReadmeFile = this.readme.endsWith("none");
        if (!noReadmeFile && this.readme) {
            if (FS.existsSync(this.readme)) {
                this.readmeFile = this.readme;
            }
        }

        const packageAndReadmeFound = () =>
            (noReadmeFile || this.readmeFile) && this.packageJson;
        const reachedTopDirectory = (dirName: string) =>
            dirName === Path.resolve(Path.join(dirName, ".."));

        let dirName = Path.resolve(
            getCommonDirectory(this.application.options.getValue("entryPoints"))
        );
        this.application.logger.verbose(
            `Begin readme.md/package.json search at ${nicePath(dirName)}`
        );
        while (!packageAndReadmeFound() && !reachedTopDirectory(dirName)) {
            FS.readdirSync(dirName).forEach((file) => {
                const lowercaseFileName = file.toLowerCase();
                if (
                    !noReadmeFile &&
                    !this.readmeFile &&
                    lowercaseFileName === "readme.md"
                ) {
                    this.readmeFile = Path.join(dirName, file);
                }

                if (!this.packageJson && lowercaseFileName === "package.json") {
                    try {
                        const packageJson = JSON.parse(
                            readFile(Path.join(dirName, file))
                        );
                        if (
                            validate(
                                { name: String, version: optional(String) },
                                packageJson
                            )
                        ) {
                            this.packageJson = packageJson;
                        }
                    } catch {
                        // Ignore
                    }
                }
            });

            dirName = Path.resolve(Path.join(dirName, ".."));
        }
    }

    private onBeginResolve(context: Context) {
        this.addEntries(context.project);
    }

    private addEntries(project: ProjectReflection) {
        if (this.readmeFile) {
            const readme = readFile(this.readmeFile);
            const comment = this.application.converter.parseRawComment(
                new MinimalSourceFile(readme, this.readmeFile)
            );

            if (comment.blockTags.length || comment.modifierTags.size) {
                const ignored = [
                    ...comment.blockTags.map((tag) => tag.tag),
                    ...comment.modifierTags,
                ];
                this.application.logger.warn(
                    `Block and modifier tags will be ignored within the readme:\n\t${ignored.join(
                        "\n\t"
                    )}`
                );
            }

            project.readme = comment.summary;
        }

        if (this.packageJson) {
            project.packageName = this.packageJson.name;
            if (!project.name) {
                project.name = project.packageName || "Documentation";
            }
            project.packageVersion = this.packageJson.version;
        } else if (!project.name) {
            this.application.logger.warn(
                'The --name option was not specified, and no package.json was found. Defaulting project name to "Documentation".'
            );
            project.name = "Documentation";
        }
    }
}
