import { resolve, join, dirname } from "path";
import { existsSync, statSync } from "fs";

import * as ts from "typescript";

import type { Options, OptionsReader } from "../options";
import type { Logger } from "../../loggers";
import { normalizePath } from "../../fs";
import { ok } from "assert";
import {
    additionalProperties,
    Infer,
    isTagString,
    optional,
    validate,
} from "../../validation";
import { nicePath } from "../../paths";
import { createRequire } from "module";
import {
    tsdocBlockTags,
    tsdocInlineTags,
    tsdocModifierTags,
} from "../tsdoc-defaults";
import { unique } from "../../array";
import { EntryPointStrategy } from "../../entry-point";

function isFile(file: string) {
    return existsSync(file) && statSync(file).isFile();
}

function isDir(path: string) {
    return existsSync(path) && statSync(path).isDirectory();
}

function isSupportForTags(obj: unknown): obj is Record<`@${string}`, boolean> {
    return (
        validate({}, obj) &&
        Object.entries(obj).every(([key, val]) => {
            return (
                /^@[a-zA-Z][a-zA-Z0-9]*$/.test(key) && typeof val === "boolean"
            );
        })
    );
}

const tsDocSchema = {
    $schema: optional(String),
    extends: optional([Array, String]),
    noStandardTags: optional(Boolean),
    tagDefinitions: optional([
        Array,
        {
            tagName: isTagString,
            syntaxKind: ["inline", "block", "modifier"] as const,
            allowMultiple: optional(Boolean),
            [additionalProperties]: false,
        },
    ]),
    supportForTags: optional(isSupportForTags),

    // The official parser has code to support for these two, but
    // the schema doesn't allow them... just silently ignore them for now.
    supportedHtmlElements: optional({}),
    reportUnsupportedHtmlElements: optional(Boolean),

    [additionalProperties]: false,
} as const;
type TsDocSchema = Infer<typeof tsDocSchema>;

export class TSConfigReader implements OptionsReader {
    /**
     * Note: Runs after the {@link TypeDocReader}.
     */
    priority = 200;

    name = "tsconfig-json";

    private seenTsdocPaths = new Set<string>();

    /**
     * Not considered part of the public API. You can use it, but it might break.
     * @internal
     */
    static findConfigFile(file: string): string | undefined {
        let fileToRead: string | undefined = file;
        if (isDir(fileToRead)) {
            fileToRead = ts.findConfigFile(file, isFile);
        }

        if (!fileToRead || !isFile(fileToRead)) {
            return;
        }

        return fileToRead;
    }

    read(container: Options, logger: Logger): void {
        const file = container.getValue("tsconfig");

        let fileToRead = TSConfigReader.findConfigFile(file);

        if (!fileToRead) {
            // If the user didn't give us this option, we shouldn't complain about not being able to find it.
            if (container.isSet("tsconfig")) {
                logger.error(
                    `The tsconfig file ${nicePath(file)} does not exist`
                );
            } else if (
                container.getValue("entryPointStrategy") !==
                EntryPointStrategy.Packages
            ) {
                logger.warn(
                    "No tsconfig file found, this will prevent TypeDoc from finding your entry points."
                );
            }
            return;
        }

        fileToRead = normalizePath(resolve(fileToRead));
        this.addTagsFromTsdocJson(container, logger, resolve(fileToRead));

        const parsed = ts.getParsedCommandLineOfConfigFile(
            fileToRead,
            {},
            {
                ...ts.sys,
                onUnRecoverableConfigFileDiagnostic:
                    logger.diagnostic.bind(logger),
            }
        );

        if (!parsed) {
            return;
        }

        logger.diagnostics(parsed.errors);

        const typedocOptions = parsed.raw?.typedocOptions ?? {};
        if (typedocOptions.options) {
            logger.error(
                [
                    "typedocOptions in tsconfig file specifies an option file to read but the option",
                    "file has already been read. This is likely a misconfiguration.",
                ].join(" ")
            );
            delete typedocOptions.options;
        }
        if (typedocOptions.tsconfig) {
            logger.error(
                "typedocOptions in tsconfig file may not specify a tsconfig file to read"
            );
            delete typedocOptions.tsconfig;
        }

        container.setCompilerOptions(
            parsed.fileNames,
            parsed.options,
            parsed.projectReferences
        );
        for (const [key, val] of Object.entries(typedocOptions || {})) {
            try {
                // We catch the error, so can ignore the strict type checks
                container.setValue(
                    key as never,
                    val as never,
                    join(fileToRead, "..")
                );
            } catch (error) {
                ok(error instanceof Error);
                logger.error(error.message);
            }
        }
    }

    private addTagsFromTsdocJson(
        container: Options,
        logger: Logger,
        tsconfig: string
    ) {
        this.seenTsdocPaths.clear();
        const tsdoc = join(dirname(tsconfig), "tsdoc.json");
        if (!isFile(tsdoc)) {
            return;
        }

        const overwritten = (
            ["blockTags", "inlineTags", "modifierTags"] as const
        ).filter((opt) => container.isSet(opt));
        if (overwritten.length) {
            logger.warn(
                `The ${overwritten.join(", ")} defined in typedoc.json will ` +
                    "be overwritten by configuration in tsdoc.json."
            );
        }

        const config = this.readTsDoc(logger, tsdoc);
        if (!config) return;

        const supported = (tag: { tagName: `@${string}` }) => {
            return config.supportForTags
                ? !!config.supportForTags[tag.tagName]
                : true;
        };

        const blockTags: `@${string}`[] = [];
        const inlineTags: `@${string}`[] = [];
        const modifierTags: `@${string}`[] = [];

        if (!config.noStandardTags) {
            blockTags.push(...tsdocBlockTags);
            inlineTags.push(...tsdocInlineTags);
            modifierTags.push(...tsdocModifierTags);
        }

        for (const { tagName, syntaxKind } of config.tagDefinitions?.filter(
            supported
        ) || []) {
            const arr = {
                block: blockTags,
                inline: inlineTags,
                modifier: modifierTags,
            }[syntaxKind];
            arr.push(tagName);
        }

        container.setValue("blockTags", unique(blockTags));
        container.setValue("inlineTags", unique(inlineTags));
        container.setValue("modifierTags", unique(modifierTags));
    }

    private readTsDoc(logger: Logger, path: string): TsDocSchema | undefined {
        if (this.seenTsdocPaths.has(path)) {
            logger.error(
                `Circular reference encountered for "extends" field of ${nicePath(
                    path
                )}`
            );
            return;
        }
        this.seenTsdocPaths.add(path);

        const { config, error } = ts.readConfigFile(
            normalizePath(path),
            ts.sys.readFile
        );

        if (error) {
            logger.error(
                `Failed to read tsdoc.json file at ${nicePath(path)}.`
            );
            return;
        }

        if (!validate(tsDocSchema, config)) {
            logger.error(
                `The file ${nicePath(path)} is not a valid tsdoc.json file.`
            );
            return;
        }

        const workingConfig: TsDocSchema = {};

        if (config.extends) {
            const resolver = createRequire(path);
            for (const extendedPath of config.extends) {
                let resolvedPath: string;
                try {
                    resolvedPath = resolver.resolve(extendedPath);
                } catch {
                    logger.error(
                        `Failed to resolve ${extendedPath} to a file in ${nicePath(
                            path
                        )}`
                    );
                    return;
                }
                const parentConfig = this.readTsDoc(logger, resolvedPath);

                if (!parentConfig) return;
                mergeConfigs(parentConfig, workingConfig);
            }
        }

        mergeConfigs(config, workingConfig);
        return workingConfig;
    }
}

function mergeConfigs(from: TsDocSchema, into: TsDocSchema) {
    if (from.supportForTags) {
        into.supportForTags ||= {};
        Object.assign(into.supportForTags, from.supportForTags);
    }
    if (from.tagDefinitions) {
        into.tagDefinitions ||= [];
        into.tagDefinitions.push(...from.tagDefinitions);
    }

    into.noStandardTags = from.noStandardTags ?? into.noStandardTags;
}
