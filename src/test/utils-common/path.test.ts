import { type NormalizedPath, NormalizedPathUtils } from "#utils";
import { deepStrictEqual as equal } from "assert/strict";

const p = (p: string) => p as NormalizedPath;

describe("NormalizedPathUtils - Posix", () => {
    it("dirname", () => {
        equal(NormalizedPathUtils.dirname(p("/home/typedoc/typedoc/package.json")), "/home/typedoc/typedoc");

        equal(NormalizedPathUtils.dirname(p("/home/typedoc/typedoc/")), "/home/typedoc");

        equal(NormalizedPathUtils.dirname(p("/")), "/");
        equal(NormalizedPathUtils.dirname(p("")), ".");
    });

    it("basename", () => {
        equal(NormalizedPathUtils.basename(p("/home/typedoc/typedoc/package.json")), "package.json");
        equal(NormalizedPathUtils.basename(p("package")), "package");
        equal(NormalizedPathUtils.basename(p("/home/")), "home");
        equal(NormalizedPathUtils.basename(p("")), "");
        equal(NormalizedPathUtils.basename(p("/home/typedoc")), "typedoc");
    });

    it("relative", () => {
        equal(NormalizedPathUtils.relative(p("/home/typedoc"), p("/home/typedoc")), "");
        equal(NormalizedPathUtils.relative(p("/home/typedoc/"), p("/home/typedoc/src/index.ts")), "src/index.ts");
        equal(NormalizedPathUtils.relative(p("/home/typedoc"), p("/home/typedoc/src/index.ts")), "src/index.ts");
        equal(
            NormalizedPathUtils.relative(p("/home/typedoc/src2/"), p("/home/typedoc/src/index.ts")),
            "../src/index.ts",
        );
        equal(
            NormalizedPathUtils.relative(p("/home/typedoc/src2"), p("/home/typedoc/src/index.ts")),
            "../src/index.ts",
        );

        equal(NormalizedPathUtils.relative(p("/e"), p("/")), "../");
        equal(NormalizedPathUtils.relative(p("/a/b/c"), p("/a")), "../..");
    });

    it("normalize", () => {
        equal(NormalizedPathUtils.normalize(p("/foo")), "/foo");
        equal(NormalizedPathUtils.normalize(p("/foo/../bar")), "/bar");
        equal(NormalizedPathUtils.normalize(p("/foo/../bar/../baz")), "/baz");
        equal(NormalizedPathUtils.normalize(p("../../foo/../bar")), "../../bar");
    });

    it("resolve", () => {
        equal(
            NormalizedPathUtils.resolve(p("/home/gerrit/typedoc"), p("/home/gerrit/typedoc/src/index.ts")),
            "/home/gerrit/typedoc/src/index.ts",
        );

        equal(
            NormalizedPathUtils.resolve(p("/home/gerrit/typedoc"), p("src/index.ts")),
            "/home/gerrit/typedoc/src/index.ts",
        );

        equal(
            NormalizedPathUtils.resolve(p("/home/gerrit/typedoc"), p("../bob/src/index.ts")),
            "/home/gerrit/bob/src/index.ts",
        );
    });

    it("isAbsolute", () => {
        equal(NormalizedPathUtils.isAbsolute(p("test.json")), false);
        equal(NormalizedPathUtils.isAbsolute(p("/test.json")), true);
    });

    it("splitFilename", () => {
        equal(NormalizedPathUtils.splitFilename(p("package.json")), { name: "package", ext: ".json" });
        equal(NormalizedPathUtils.splitFilename(p("package")), { name: "package", ext: "" });
        equal(NormalizedPathUtils.splitFilename(p(".bashrc")), { name: ".bashrc", ext: "" });
    });
});

describe("NormalizedPathUtils - Windows", () => {
    it("dirname", () => {
        equal(NormalizedPathUtils.dirname(p("C:/home/typedoc/typedoc/package.json")), "C:/home/typedoc/typedoc");

        equal(NormalizedPathUtils.dirname(p("C:/home/typedoc/typedoc/")), "C:/home/typedoc");

        equal(NormalizedPathUtils.dirname(p("C:/")), "C:/");
        equal(NormalizedPathUtils.dirname(p("")), ".");
    });

    it("basename", () => {
        equal(NormalizedPathUtils.basename(p("C:/home/typedoc/typedoc/package.json")), "package.json");
        equal(NormalizedPathUtils.basename(p("package")), "package");
        equal(NormalizedPathUtils.basename(p("C:/home/")), "home");
        equal(NormalizedPathUtils.basename(p("")), "");
        equal(NormalizedPathUtils.basename(p("C:/home/typedoc")), "typedoc");
    });

    it("relative", () => {
        equal(NormalizedPathUtils.relative(p("C:/home/typedoc"), p("C:/home/typedoc")), "");
        equal(NormalizedPathUtils.relative(p("C:/home/typedoc/"), p("C:/home/typedoc/src/index.ts")), "src/index.ts");
        equal(NormalizedPathUtils.relative(p("C:/home/typedoc"), p("C:/home/typedoc/src/index.ts")), "src/index.ts");
        equal(
            NormalizedPathUtils.relative(p("C:/home/typedoc/src2/"), p("C:/home/typedoc/src/index.ts")),
            "../src/index.ts",
        );
        equal(
            NormalizedPathUtils.relative(p("C:/home/typedoc/src2"), p("C:/home/typedoc/src/index.ts")),
            "../src/index.ts",
        );

        equal(NormalizedPathUtils.relative(p("C:/e"), p("C:/")), "../");
        equal(NormalizedPathUtils.relative(p("C:/a/b/c"), p("C:/a")), "../..");
    });

    it("normalize", () => {
        equal(NormalizedPathUtils.normalize(p("C:/foo")), "C:/foo");
        equal(NormalizedPathUtils.normalize(p("C:/foo/../bar")), "C:/bar");
        equal(NormalizedPathUtils.normalize(p("C:/foo/../bar/../baz")), "C:/baz");
        equal(NormalizedPathUtils.normalize(p("../../foo/../bar")), "../../bar");
        equal(NormalizedPathUtils.normalize(p("C:/../../foo/../bar")), "C:/bar");
    });

    it("resolve", () => {
        equal(
            NormalizedPathUtils.resolve(p("C:/home/gerrit/typedoc"), p("C:/home/gerrit/typedoc/src/index.ts")),
            "C:/home/gerrit/typedoc/src/index.ts",
        );

        equal(
            NormalizedPathUtils.resolve(p("C:/home/gerrit/typedoc"), p("src/index.ts")),
            "C:/home/gerrit/typedoc/src/index.ts",
        );

        equal(
            NormalizedPathUtils.resolve(p("C:/home/gerrit/typedoc"), p("../bob/src/index.ts")),
            "C:/home/gerrit/bob/src/index.ts",
        );
    });

    it("isAbsolute", () => {
        equal(NormalizedPathUtils.isAbsolute(p("test.json")), false);
        equal(NormalizedPathUtils.isAbsolute(p("C:/test.json")), true);
    });
});
