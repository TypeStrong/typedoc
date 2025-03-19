import { dirname, join, resolve } from "path";

import ts from "typescript";

import type { Options, OptionsReader } from "../options.js";
import type { FileSystem } from "../../fs.js";
import { ok } from "assert";
import { i18n, type Logger, type TranslatedString, unique, Validation } from "#utils";
import { nicePath, normalizePath } from "../../paths.js";
import { createRequire } from "module";
import { tsdocBlockTags, tsdocInlineTags, tsdocModifierTags } from "../tsdoc-defaults.js";
import { findTsConfigFile, getTypeDocOptionsFromTsConfig, readTsConfig } from "../../tsconfig.js";
import { diagnostics } from "../../loggers.js";

function isSupportForTags(obj: unknown): obj is Record<`@${string}`, boolean> {
    return (
        Validation.validate({}, obj) &&
        Object.entries(obj).every(([key, val]) => {
            return (
                /^@[a-zA-Z][a-zA-Z0-9]*$/.test(key) && typeof val === "boolean"
            );
        })
    );
}

const tsDocSchema = {
    $schema: Validation.optional(String),
    extends: Validation.optional([Array, String]),
    noStandardTags: Validation.optional(Boolean),
    tagDefinitions: Validation.optional([
        Array,
        {
            tagName: Validation.isTagString,
            syntaxKind: ["inline", "block", "modifier"] as const,
            allowMultiple: Validation.optional(Boolean),
            [Validation.additionalProperties]: false,
        },
    ]),
    supportForTags: Validation.optional(isSupportForTags),

    // The official parser has code to support for these two, but
    // the schema doesn't allow them... just silently ignore them for now.
    supportedHtmlElements: Validation.optional({}),
    reportUnsupportedHtmlElements: Validation.optional(Boolean),

    [Validation.additionalProperties]: false,
} as const;
type TsDocSchema = Validation.Infer<typeof tsDocSchema>;

export class TSConfigReader implements OptionsReader {
    /**
     * Note: Runs after the {@link TypeDocReader}.
     */
    order = 200;

    name = "tsconfig-json";

    supportsPackages = true;

    private seenTsdocPaths = new Set<string>();

    read(
        container: Options,
        logger: Logger,
        fs: FileSystem,
        cwd: string,
    ): void {
        const file = container.getValue("tsconfig") || cwd;

        let fileToRead = findTsConfigFile(fs, file);

        if (!fileToRead) {
            // If the user didn't give us this option, we shouldn't complain about not being able to find it.
            if (container.isSet("tsconfig")) {
                logger.error(
                    i18n.tsconfig_file_0_does_not_exist(nicePath(file)),
                );
            }
            return;
        }

        fileToRead = normalizePath(resolve(fileToRead));
        logger.verbose(`Reading tsconfig at ${nicePath(fileToRead)}`);
        this.addTagsFromTsdocJson(container, logger, resolve(fileToRead), fs);

        const parsed = readTsConfig(fileToRead, logger);
        if (!parsed) {
            return;
        }

        diagnostics(logger, parsed.errors);
        if (parsed.errors.length) {
            return;
        }

        const typedocOptions = getTypeDocOptionsFromTsConfig(fs, fileToRead);
        if (typedocOptions.options) {
            logger.error(i18n.tsconfig_file_specifies_options_file());
            delete typedocOptions.options;
        }
        if (typedocOptions.tsconfig) {
            logger.error(i18n.tsconfig_file_specifies_tsconfig_file());
            delete typedocOptions.tsconfig;
        }

        container.setCompilerOptions(
            parsed.fileNames,
            parsed.options,
            parsed.projectReferences,
        );
        for (const [key, val] of Object.entries(typedocOptions || {})) {
            try {
                // We catch the error, so can ignore the strict type checks
                container.setValue(
                    key as never,
                    val as never,
                    join(fileToRead, ".."),
                );
            } catch (error) {
                ok(error instanceof Error);
                logger.error(error.message as TranslatedString);
            }
        }
    }

    private addTagsFromTsdocJson(
        container: Options,
        logger: Logger,
        tsconfig: string,
        fs: FileSystem,
    ) {
        this.seenTsdocPaths.clear();
        const tsdoc = join(dirname(tsconfig), "tsdoc.json");
        if (!fs.isFile(tsdoc)) {
            return;
        }

        const overwritten = (
            ["blockTags", "inlineTags", "modifierTags"] as const
        ).filter((opt) => container.isSet(opt));
        if (overwritten.length) {
            logger.warn(
                i18n.tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json(
                    overwritten.join(", "),
                ),
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

        for (
            const { tagName, syntaxKind } of config.tagDefinitions?.filter(
                supported,
            ) || []
        ) {
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
                i18n.circular_reference_extends_0(nicePath(path)),
            );
            return;
        }
        this.seenTsdocPaths.add(path);

        const { config, error } = ts.readConfigFile(
            normalizePath(path),
            ts.sys.readFile,
        );

        if (error) {
            logger.error(i18n.failed_read_tsdoc_json_0(nicePath(path)));
            return;
        }

        if (!Validation.validate(tsDocSchema, config)) {
            logger.error(i18n.invalid_tsdoc_json_0(nicePath(path)));
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
                        i18n.failed_resolve_0_to_file_in_1(
                            extendedPath,
                            nicePath(path),
                        ),
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
