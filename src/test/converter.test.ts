import { deepStrictEqual as equal, ok } from "assert";
import * as FS from "fs";
import * as Path from "path";
import {
    Comment,
    type CommentDisplayPart,
    CommentTag,
    type JSONOutput,
    ProjectReflection,
    ReferenceReflection,
    ReferenceType,
    Reflection,
    ReflectionCategory,
    ReflectionGroup,
    resetReflectionID,
    Serializer,
    type SomeReflection,
    SourceReference,
} from "../index.js";
import type { ModelToObject } from "../lib/serialization/schema.js";
import { getExpandedEntryPointsForPaths, NodeFileSystem, normalizePath } from "../lib/utils/index.js";
import { getConverterApp, getConverterBase, getConverterProgram } from "./programs.js";
import { FileRegistry } from "../lib/models/FileRegistry.js";
import { ValidatingFileRegistry } from "../lib/utils/ValidatingFileRegistry.js";

const fs = new NodeFileSystem();

const comparisonSerializer = new Serializer();
comparisonSerializer.addSerializer({
    priority: 0,
    supports(x) {
        return x instanceof ReferenceType;
    },
    toObject(ref: ReferenceType, obj: any) {
        if (ref.reflection) {
            obj.target = ref.reflection.getFullName();
        }
        return obj;
    },
});
comparisonSerializer.addSerializer({
    priority: 0,
    supports(x) {
        return x instanceof Comment;
    },
    toObject(comment: Comment, obj: JSONOutput.Comment) {
        obj.summary.forEach((part, i) => {
            if (part.kind === "inline-tag" && typeof part.target === "number") {
                const origPart = comment.summary[i] as CommentDisplayPart & {
                    target: Reflection;
                };
                part.target = origPart.target.getFullName();
            }
        });
        return obj;
    },
});
comparisonSerializer.addSerializer<CommentTag>({
    priority: 0,
    supports(x) {
        return x instanceof CommentTag;
    },
    toObject(tag: any, obj: JSONOutput.CommentTag) {
        obj["content"].forEach(
            (part: JSONOutput.CommentDisplayPart, i: number) => {
                if (
                    part.kind === "inline-tag" &&
                    typeof part.target === "number"
                ) {
                    part.target = tag.content[i].target.getFullName();
                }
            },
        );
        return obj;
    },
});
comparisonSerializer.addSerializer<SomeReflection>({
    priority: 0,
    supports(x) {
        return x instanceof Reflection;
    },
    toObject(refl, obj: any) {
        delete obj["id"];
        if (refl.isDeclaration()) {
            obj["childrenIncludingDocuments"] = refl.childrenIncludingDocuments?.map(id => id.getFullName());
        }
        return obj;
    },
});
comparisonSerializer.addSerializer({
    priority: 0,
    supports(x) {
        return x instanceof ReferenceReflection;
    },
    toObject(refl: ReferenceReflection, obj: any) {
        obj.target = refl.getTargetReflectionDeep().getFullName();
        return obj;
    },
});
comparisonSerializer.addSerializer({
    priority: 0,
    supports(x) {
        return x instanceof ReflectionCategory || x instanceof ReflectionGroup;
    },
    toObject(refl: ReflectionCategory | ReflectionGroup, obj: any) {
        obj.children = refl.children.map((c) => c.getFullName());
        return obj;
    },
});
comparisonSerializer.addSerializer({
    priority: -1,
    supports(obj) {
        return obj instanceof SourceReference;
    },
    toObject(
        ref: SourceReference,
        obj: ModelToObject<SourceReference>,
        _serializer,
    ) {
        if (obj.url) {
            obj.url = `typedoc://${
                obj.url.substring(
                    obj.url.indexOf(ref.fileName),
                )
            }`;
        }
        return obj;
    },
});
comparisonSerializer.addSerializer({
    priority: -1,
    supports(obj) {
        return obj instanceof ProjectReflection;
    },
    toObject(project: ProjectReflection, obj: JSONOutput.ProjectReflection) {
        const idMap: Record<string, JSONOutput.ReflectionSymbolId> = {};
        for (const [k, v] of Object.entries(obj.symbolIdMap || {})) {
            idMap[project.getReflectionById(+k)!.getFullName()] = v;
        }
        obj.symbolIdMap = idMap;
        delete obj.packageVersion;
        return obj;
    },
});
comparisonSerializer.addSerializer({
    priority: -1,
    supports(obj) {
        return obj instanceof FileRegistry;
    },
    toObject(_media: FileRegistry, obj: JSONOutput.FileRegistry) {
        obj.reflections = {};
        return obj;
    },
});

describe("Converter", function () {
    const base = getConverterBase();
    const app = getConverterApp();

    it("Compiles", () => {
        getConverterProgram();
    });

    const checks: [string, () => void, () => void][] = [
        [
            "specs",
            () => {
                // nop
            },
            () => {
                // nop
            },
        ],
        [
            "specs-with-lump-categories",
            () => app.options.setValue("categorizeByGroup", false),
            () => app.options.setValue("categorizeByGroup", true),
        ],
        [
            "specs.nodoc",
            () => app.options.setValue("excludeNotDocumented", true),
            () => app.options.setValue("excludeNotDocumented", false),
        ],
    ];

    FS.readdirSync(base).forEach(function (directory) {
        const path = Path.join(base, directory);
        if (!FS.lstatSync(path).isDirectory()) {
            return;
        }

        describe(directory, function () {
            for (const [file, before, after] of checks) {
                const specsFile = Path.join(path, `${file}.json`);
                if (!FS.existsSync(specsFile)) {
                    continue;
                }

                const specs = JSON.parse(FS.readFileSync(specsFile, "utf-8"));

                let result: ProjectReflection | undefined;

                it(`[${file}] converts fixtures`, function () {
                    before();
                    resetReflectionID();
                    app.files = new ValidatingFileRegistry(fs);
                    const entryPoints = getExpandedEntryPointsForPaths(
                        app.logger,
                        [path],
                        app.options,
                        [getConverterProgram()],
                        fs,
                    );
                    ok(entryPoints, "Failed to get entry points");
                    result = app.converter.convert(entryPoints);
                    result.name = directory;
                    after();
                });

                it(`[${file}] matches specs`, function () {
                    // Pass data through a parse/stringify to get rid of undefined properties
                    const data = JSON.parse(
                        JSON.stringify(
                            app.serializer.projectToObject(
                                result!,
                                normalizePath(process.cwd()),
                            ),
                        ),
                    );
                    delete data.symbolIdMap;
                    const specCopy = { ...specs };
                    delete specCopy.symbolIdMap;

                    equal(data, specCopy);
                });

                it(`[${file}] round trips revival`, () => {
                    const revived = app.deserializer.reviveProject(
                        specs.name,
                        specs,
                        {
                            projectRoot: normalizePath(process.cwd()),
                            registry: new FileRegistry(),
                        },
                    );
                    const specs2 = JSON.parse(
                        JSON.stringify(
                            comparisonSerializer.projectToObject(
                                revived,
                                normalizePath(process.cwd()),
                            ),
                        ),
                    );

                    // Pass data through a parse/stringify to get rid of undefined properties
                    const data = JSON.parse(
                        JSON.stringify(
                            comparisonSerializer.projectToObject(
                                result!,
                                normalizePath(process.cwd()),
                            ),
                        ),
                    );

                    equal(data, specs2);
                });
            }
        });
    });
});
