import * as Path from "path";
import * as FS from "fs";

import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { BindOption, EntryPointStrategy, readFile } from "../../utils";
import { getCommonDirectory } from "../../utils/fs";
import { nicePath } from "../../utils/paths";
import { lexCommentString } from "../comments/rawLexer";
import { parseComment } from "../comments/parser";
import { MinimalSourceFile } from "../../utils/minimalSourceFile";

/**
 * A handler that tries to find the package.json and readme.md files of the
 * current project.
 */
@Component({ name: "package" })
export class PackagePlugin extends ConverterComponent {
    @BindOption("readme")
    readme!: string;

    @BindOption("includeVersion")
    includeVersion!: boolean;

    @BindOption("entryPointStrategy")
    entryPointStrategy!: EntryPointStrategy;

    /**
     * The file name of the found readme.md file.
     */
    private readmeFile?: string;

    /**
     * The file name of the found package.json file.
     */
    private packageFile?: string;

    /**
     * Create a new PackageHandler instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_BEGIN]: this.onBegin,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
            [Converter.EVENT_END]: () => {
                delete this.readmeFile;
                delete this.packageFile;
            },
        });
    }

    /**
     * Triggered when the converter begins converting a project.
     */
    private onBegin(_context: Context) {
        this.readmeFile = undefined;
        this.packageFile = undefined;

        // Path will be resolved already. This is kind of ugly, but...
        const noReadmeFile = this.readme.endsWith("none");
        if (!noReadmeFile && this.readme) {
            if (FS.existsSync(this.readme)) {
                this.readmeFile = this.readme;
            }
        }

        const packageAndReadmeFound = () =>
            (noReadmeFile || this.readmeFile) && this.packageFile;
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

                if (!this.packageFile && lowercaseFileName === "package.json") {
                    this.packageFile = Path.join(dirName, file);
                }
            });

            dirName = Path.resolve(Path.join(dirName, ".."));
        }
    }

    /**
     * Triggered when the converter begins resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBeginResolve(context: Context) {
        const project = context.project;
        if (this.readmeFile) {
            const readme = readFile(this.readmeFile);
            const comment = parseComment(
                lexCommentString(readme),
                context.converter.config,
                new MinimalSourceFile(readme, this.readmeFile),
                context.logger
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

        if (this.packageFile) {
            const packageInfo = JSON.parse(readFile(this.packageFile));
            if (!project.name) {
                if (!packageInfo.name) {
                    context.logger.warn(
                        'The --name option was not specified, and package.json does not have a name field. Defaulting project name to "Documentation".'
                    );
                    project.name = "Documentation";
                } else {
                    project.name = String(packageInfo.name);
                }
            }
            if (this.includeVersion) {
                if (packageInfo.version) {
                    project.name = `${project.name} - v${packageInfo.version}`;
                } else {
                    // since not all monorepo specifies a meaningful version to the main package.json
                    // this warning should be optional
                    if (
                        this.entryPointStrategy !== EntryPointStrategy.Packages
                    ) {
                        context.logger.warn(
                            "--includeVersion was specified, but package.json does not specify a version."
                        );
                    }
                }
            }
        } else {
            if (!project.name) {
                context.logger.warn(
                    'The --name option was not specified, and no package.json was found. Defaulting project name to "Documentation".'
                );
                project.name = "Documentation";
            }
            if (this.includeVersion) {
                context.logger.warn(
                    "--includeVersion was specified, but no package.json was found. Not adding package version to the documentation."
                );
            }
        }
    }
}
