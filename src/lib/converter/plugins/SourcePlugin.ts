import ts from "typescript";

import {
    DeclarationReflection,
    SignatureReflection,
} from "../../models/reflections/index";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { Option, normalizePath, getCommonDirectory } from "../../utils";
import { isNamedNode } from "../utils/nodes";
import { relative } from "path";
import { SourceReference } from "../../models";
import { gitIsInstalled, RepositoryManager } from "../utils/repository";

/**
 * A handler that attaches source file information to reflections.
 */
@Component({ name: "source" })
export class SourcePlugin extends ConverterComponent {
    @Option("disableSources")
    accessor disableSources!: boolean;

    @Option("gitRevision")
    accessor gitRevision!: string;

    @Option("gitRemote")
    accessor gitRemote!: string;

    @Option("disableGit")
    accessor disableGit!: boolean;

    @Option("sourceLinkTemplate")
    accessor sourceLinkTemplate!: string;

    @Option("basePath")
    accessor basePath!: string;

    /**
     * All file names to find the base path from.
     */
    private fileNames = new Set<string>();

    private repositories?: RepositoryManager;

    /**
     * Create a new SourceHandler instance.
     */
    override initialize() {
        this.owner.on(Converter.EVENT_END, this.onEnd.bind(this));
        this.owner.on(
            Converter.EVENT_CREATE_DECLARATION,
            this.onDeclaration.bind(this),
        );
        this.owner.on(
            Converter.EVENT_CREATE_SIGNATURE,
            this.onSignature.bind(this),
        );
        this.owner.on(
            Converter.EVENT_RESOLVE_BEGIN,
            this.onBeginResolve.bind(this),
        );
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
        reflection: DeclarationReflection,
    ) {
        if (this.disableSources) return;

        const symbol = reflection.project.getSymbolFromReflection(reflection);
        for (const node of symbol?.declarations || []) {
            const sourceFile = node.getSourceFile();
            const fileName = normalizePath(sourceFile.fileName);
            this.fileNames.add(fileName);

            let position: ts.LineAndCharacter;
            if (ts.isSourceFile(node)) {
                position = { character: 0, line: 0 };
            } else {
                position = ts.getLineAndCharacterOfPosition(
                    sourceFile,
                    getLocationNode(node).getStart(),
                );
            }

            reflection.sources ||= [];
            reflection.sources.push(
                new SourceReference(
                    fileName,
                    position.line + 1,
                    position.character,
                ),
            );
        }
    }

    private onSignature(
        _context: Context,
        reflection: SignatureReflection,
        sig?:
            | ts.SignatureDeclaration
            | ts.IndexSignatureDeclaration
            | ts.JSDocSignature,
    ) {
        if (this.disableSources || !sig) return;

        const sourceFile = sig.getSourceFile();
        const fileName = normalizePath(sourceFile.fileName);
        this.fileNames.add(fileName);

        const position = ts.getLineAndCharacterOfPosition(
            sourceFile,
            getLocationNode(sig).getStart(),
        );

        reflection.sources ||= [];
        reflection.sources.push(
            new SourceReference(
                fileName,
                position.line + 1,
                position.character,
            ),
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
                context.i18n.disable_git_set_but_not_source_link_template(),
            );
            return;
        }
        if (
            this.disableGit &&
            this.sourceLinkTemplate.includes("{gitRevision}") &&
            !this.gitRevision
        ) {
            this.application.logger.warn(
                context.i18n.disable_git_set_and_git_revision_used(),
            );
        }

        const basePath =
            this.basePath || getCommonDirectory([...this.fileNames]);
        this.repositories ||= new RepositoryManager(
            basePath,
            this.gitRevision,
            this.gitRemote,
            this.sourceLinkTemplate,
            this.disableGit,
            this.application.logger,
        );

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

            if (replaceSourcesWithParentSources(refl)) {
                refl.sources = (refl.parent as DeclarationReflection).sources;
            }

            for (const source of refl.sources || []) {
                if (this.disableGit || gitIsInstalled()) {
                    const repo = this.repositories.getRepository(
                        source.fullFileName,
                    );
                    source.url = repo?.getURL(source.fullFileName, source.line);
                }

                source.fileName = normalizePath(
                    relative(basePath, source.fullFileName),
                );
            }
        }
    }
}

function getLocationNode(node: ts.Node) {
    if (isNamedNode(node)) return node.name;
    return node;
}

function replaceSourcesWithParentSources(
    refl: SignatureReflection | DeclarationReflection,
) {
    if (refl instanceof DeclarationReflection || !refl.sources) {
        return false;
    }

    const symbol = refl.project.getSymbolFromReflection(refl.parent);
    if (!symbol?.declarations) {
        return false;
    }

    for (const decl of symbol.declarations) {
        const file = decl.getSourceFile();
        const pos = file.getLineAndCharacterOfPosition(decl.pos);
        const end = file.getLineAndCharacterOfPosition(decl.end);

        if (
            refl.sources.some(
                (src) =>
                    src.fullFileName === file.fileName &&
                    pos.line <= src.line - 1 &&
                    src.line - 1 <= end.line,
            )
        ) {
            return false;
        }
    }

    return true;
}
