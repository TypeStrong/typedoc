import { deepStrictEqual as equal, ok, throws } from "assert";
import { DefaultRouter } from "../../lib/output/index.js";
import { getConverter2App, getConverter2Project } from "../programs.js";
import { query } from "../utils.js";
import {
    DeclarationReflection,
    ReflectionKind,
} from "../../lib/models/index.js";

const app = getConverter2App();

const getProject = () => getConverter2Project(["router"], "behavior");

describe("DefaultRouter", () => {
    it("Creates index page if project has a readme", () => {
        const project = getProject();
        project.readme = [{ kind: "text", text: "text" }];
        const router = new DefaultRouter(app);

        const pages = router.buildPages(project);
        equal(pages.map((p) => [p.model.getFullName(), p.url]).slice(0, 3), [
            ["typedoc", "index.html"],
            ["typedoc", "modules.html"],
            ["typedoc", "hierarchy.html"],
        ]);
    });

    it("Defines URLs for expected reflections", () => {
        const project = getProject();
        delete project.readme;
        const router = new DefaultRouter(app);

        const pages = router.buildPages(project);
        equal(
            pages.map((p) => [p.model.getFullName(), p.url]),
            [
                ["typedoc", "index.html"],
                ["typedoc", "hierarchy.html"],
                ["Nested", "modules/Nested.html"],
                ["Nested.refl", "variables/Nested.refl.html"],
                ["Foo", "interfaces/Foo.html"],
                ["Obj", "types/Obj.html"],
                ["ObjArray", "types/ObjArray.html"],
                ["abc", "variables/abc.html"],
                ["func", "functions/func.html"],
                ["Func", "functions/Func-1.html"],
            ],
        );

        const linkable = router.getLinkableReflections();
        equal(
            linkable.map((refl) => [
                refl.getFullName(),
                router.getFullUrl(refl),
            ]),
            [
                ["typedoc", "index.html"],
                ["Nested", "modules/Nested.html"],
                ["Nested.refl", "variables/Nested.refl.html"],
                ["Foo", "interfaces/Foo.html"],
                ["Foo.codeGeneration", "interfaces/Foo.html#codegeneration"],
                ["Foo.iterator", "interfaces/Foo.html#iterator"],
                ["Foo.iterator.iterator", "interfaces/Foo.html#iterator-1"],
                ["Obj", "types/Obj.html"],
                ["Obj.__type.a", "types/Obj.html#a"],
                ["ObjArray", "types/ObjArray.html"],
                ["abc", "variables/abc.html"],
                ["abc.__type.abcProp", "variables/abc.html#abcprop"],
                ["func", "functions/func.html"],
                ["func.func", "functions/func.html#func"],
                ["Func", "functions/Func-1.html"],
                ["Func.Func", "functions/Func-1.html#func"],
            ],
        );
    });

    it("Can retrieve the anchor for a reflection", () => {
        const project = getProject();
        const router = new DefaultRouter(app);
        router.buildPages(project);

        equal(router.getAnchor(query(project, "Obj")), undefined);
        equal(
            router.getAnchor(query(project, "Foo.codeGeneration")),
            "codegeneration",
        );
    });

    it("Can check if a reflection has its own page", () => {
        const project = getProject();
        const router = new DefaultRouter(app);
        router.buildPages(project);

        equal(router.hasOwnDocument(query(project, "Obj")), true);
        equal(
            router.hasOwnDocument(query(project, "Foo.codeGeneration")),
            false,
        );

        equal(
            router.hasOwnDocument(
                new DeclarationReflection("dummy", ReflectionKind.Variable),
            ),
            false,
        );
    });

    it("Can get relative URLs between pages", () => {
        const project = getProject();
        const router = new DefaultRouter(app);
        router.buildPages(project);

        const Foo = query(project, "Foo");
        const codeGen = query(project, "Foo.codeGeneration");
        const abc = query(project, "abc");
        const Obj = query(project, "Obj");
        const ObjArray = query(project, "ObjArray");

        equal(router.relativeUrl(Foo, abc), "../variables/abc.html");
        equal(router.relativeUrl(abc, Foo), "../interfaces/Foo.html");
        equal(
            router.relativeUrl(abc, codeGen),
            "../interfaces/Foo.html#codegeneration",
        );

        equal(router.relativeUrl(Obj, ObjArray), "ObjArray.html");
        equal(router.relativeUrl(Foo, codeGen), "#codegeneration");
    });

    it("Can get a URL to an asset relative to the base", () => {
        const project = getProject();
        const router = new DefaultRouter(app);
        router.buildPages(project);

        const Foo = query(project, "Foo");

        equal(
            router.baseRelativeUrl(Foo, "assets/search.js"),
            "../assets/search.js",
        );
        equal(
            router.baseRelativeUrl(project, "assets/search.js"),
            "assets/search.js",
        );
    });

    it("Can get a full URL to a reflection", () => {
        const project = getProject();
        const router = new DefaultRouter(app);
        router.buildPages(project);

        const Foo = query(project, "Foo");

        equal(router.getFullUrl(Foo), "interfaces/Foo.html");

        const ObjArray = query(project, "ObjArray");
        equal(ObjArray.type?.type, "array");
        equal(ObjArray.type.elementType.type, "reflection");
        const b = ObjArray.type.elementType.declaration.getChildByName(["b"])!;
        throws(() => router.getFullUrl(b));
    });

    it("Can get the slugger for the appropriate page", () => {
        const project = getProject();
        const router = new DefaultRouter(app);
        router.buildPages(project);

        const Foo = query(project, "Foo");
        const codeGen = query(project, "Foo.codeGeneration");
        ok(router.getSlugger(Foo) === router.getSlugger(codeGen));
    });
});
