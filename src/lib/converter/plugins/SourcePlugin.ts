import * as ts from "typescript";

import type { Reflection } from "../../models/reflections/index";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { BindOption } from "../../utils";
import { isNamedNode } from "../utils/nodes";
import { getCommonDirectory, normalizePath } from "../../utils/fs";
import { relative } from "path";
import { SourceReference } from "../../models";

/**
 * A handler that attaches source file information to reflections.
 */
@Component({ name: "source" })
export class SourcePlugin extends ConverterComponent {
    @BindOption("disableSources")
    readonly disableSources!: boolean;

    /**
     * All file names to find the base path from.
     */
    private fileNames = new Set<string>();

    /**
     * Create a new SourceHandler instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_END]: this.onEnd,
            [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [Converter.EVENT_CREATE_SIGNATURE]: this.onDeclaration,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
        });
    }

    private onEnd() {
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
    private onDeclaration(_context: Context, reflection: Reflection) {
        if (this.disableSources) return;

        const symbol = reflection.project.getSymbolFromReflection(reflection);
        for (const node of symbol?.declarations || []) {
            const sourceFile = node.getSourceFile();
            const fileName = sourceFile.fileName;
            this.fileNames.add(fileName);

            let position: ts.LineAndCharacter;
            if (isNamedNode(node)) {
                position = ts.getLineAndCharacterOfPosition(
                    sourceFile,
                    node.name.getStart()
                );
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

    /**
     * Triggered when the converter begins resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBeginResolve(context: Context) {
        if (this.disableSources) return;
        const basePath = getCommonDirectory([...this.fileNames]);

        for (const refl of Object.values(context.project.reflections)) {
            for (const source of refl.sources || []) {
                source.fileName = normalizePath(
                    relative(basePath, source.fullFileName)
                );
            }
        }
    }
}
