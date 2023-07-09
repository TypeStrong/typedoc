import ts from "typescript";

import {
    DeclarationReflection,
    SignatureReflection,
} from "../../models/reflections/index";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { BindOption, normalizePath, getCommonDirectory } from "../../utils";
import { isNamedNode } from "../utils/nodes";
import { dirname, relative } from "path";
import { SourceReference } from "../../models";
import {
    AssumedRepository,
    gitIsInstalled,
    GitRepository,
    Repository,
} from "../utils/repository";
import { BasePath } from "../utils/base-path";

/**
 * A handler that attaches source file information to reflections.
 */
@Component({ name: "source" })
export class SourcePlugin extends ConverterComponent {
    @BindOption("disableSources")
    readonly disableSources!: boolean;

    @BindOption("gitRevision")
    readonly gitRevision!: string;

    @BindOption("gitRemote")
    readonly gitRemote!: string;

    @BindOption("disableGit")
    readonly disableGit!: boolean;

    @BindOption("sourceLinkTemplate")
    readonly sourceLinkTemplate!: string;

    @BindOption("basePath")
    readonly basePath!: string;

    /**
     * All file names to find the base path from.
     */
    private fileNames = new Set<string>();

    /**
     * List of known repositories.
     */
    private repositories: { [path: string]: Repository } = {};

    /**
     * List of paths known to be not under git control.
     */
    private ignoredPaths = new Set<string>();

    /**
     * Create a new SourceHandler instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_END]: this.onEnd,
            [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [Converter.EVENT_CREATE_SIGNATURE]: this.onSignature,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
        });
    }

    private onEnd() {
        // Should probably clear repositories/ignoredPaths here, but these aren't likely to change between runs...
        this.fileNames.clear();
    }

    /**
     * Triggered when the converter has created a declaration reflection.
     *
     * Attach the current source file to the {@link DeclarationReflection.sources} array.
     *
     * @param _context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     */
    private onDeclaration(
        _context: Context,
        reflection: DeclarationReflection
    ) {
        if (this.disableSources) return;

        const symbol = reflection.project.getSymbolFromReflection(reflection);
        for (const node of symbol?.declarations || []) {
            const sourceFile = node.getSourceFile();
            const fileName = BasePath.normalize(sourceFile.fileName);
            this.fileNames.add(fileName);

            let position: ts.LineAndCharacter;
            if (isNamedNode(node)) {
                position = ts.getLineAndCharacterOfPosition(
                    sourceFile,
                    node.name.getStart()
                );
            } else if (ts.isSourceFile(node)) {
                position = { character: 0, line: 0 };
            } else {
                position = ts.getLineAndCharacterOfPosition(
                    sourceFile,
                    node.getStart()
                );
            }

            reflection.sources ||= [];
            reflection.sources.push(
                new SourceReference(
                    fileName,
                    position.line + 1,
                    position.character
                )
            );
        }
    }

    private onSignature(
        _context: Context,
        reflection: SignatureReflection,
        sig?:
            | ts.SignatureDeclaration
            | ts.IndexSignatureDeclaration
            | ts.JSDocSignature
    ) {
        if (this.disableSources || !sig) return;

        const sourceFile = sig.getSourceFile();
        const fileName = BasePath.normalize(sourceFile.fileName);
        this.fileNames.add(fileName);

        const position = ts.getLineAndCharacterOfPosition(
            sourceFile,
            sig.getStart()
        );

        reflection.sources ||= [];
        reflection.sources.push(
            new SourceReference(fileName, position.line + 1, position.character)
        );
    }

    /**
     * Triggered when the converter begins resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBeginResolve(context: Context) {
        if (this.disableSources) return;

        if (this.disableGit && !this.sourceLinkTemplate) {
            this.application.logger.error(
                `disableGit is set, but sourceLinkTemplate is not, so source links cannot be produced. Set a sourceLinkTemplate or disableSources to prevent source tracking.`
            );
            return;
        }
        if (
            this.disableGit &&
            this.sourceLinkTemplate.includes("{gitRevision}") &&
            !this.gitRevision
        ) {
            this.application.logger.warn(
                `disableGit is set and sourceLinkTemplate contains {gitRevision}, which will be replaced with an empty string as no revision was provided.`
            );
        }

        const basePath =
            this.basePath || getCommonDirectory([...this.fileNames]);

        for (const id in context.project.reflections) {
            const refl = context.project.reflections[id];

            if (
                !(
                    refl instanceof DeclarationReflection ||
                    refl instanceof SignatureReflection
                )
            ) {
                continue;
            }

            for (const source of refl.sources || []) {
                if (this.disableGit || gitIsInstalled()) {
                    const repo = this.getRepository(
                        basePath,
                        source.fullFileName
                    );
                    source.url = repo?.getURL(source.fullFileName, source.line);
                }

                source.fileName = normalizePath(
                    relative(basePath, source.fullFileName)
                );
            }
        }
    }

    /**
     * Check whether the given file is placed inside a repository.
     *
     * @param fileName  The name of the file a repository should be looked for.
     * @returns The found repository info or undefined.
     */
    private getRepository(
        basePath: string,
        fileName: string
    ): Repository | undefined {
        if (this.disableGit) {
            return new AssumedRepository(
                basePath,
                this.gitRevision,
                this.sourceLinkTemplate
            );
        }

        // Check for known non-repositories
        const dirName = dirname(fileName);
        const segments = dirName.split("/");
        for (let i = segments.length; i > 0; i--) {
            if (this.ignoredPaths.has(segments.slice(0, i).join("/"))) {
                return;
            }
        }

        // Check for known repositories
        for (const path of Object.keys(this.repositories)) {
            if (fileName.toLowerCase().startsWith(path)) {
                return this.repositories[path];
            }
        }

        // Try to create a new repository
        const repository = GitRepository.tryCreateRepository(
            dirName,
            this.sourceLinkTemplate,
            this.gitRevision,
            this.gitRemote,
            this.application.logger
        );
        if (repository) {
            this.repositories[repository.path.toLowerCase()] = repository;
            return repository;
        }

        // No repository found, add path to ignored paths
        this.ignoredPaths.add(dirName);
    }
}
