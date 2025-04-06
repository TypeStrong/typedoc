import { type Reflection, resetReflectionID } from "#models";
import { loadTestHighlighter } from "#node-utils";
import { rm } from "node:fs/promises";
import { DefaultTheme, KindRouter, PageEvent, PageKind, type RenderTemplate } from "../../lib/output/index.js";
import { type JsxChildren, type JsxElement, JsxFragment } from "../../lib/utils-common/jsx.elements.js";
import { Raw } from "../../lib/utils-common/jsx.js";
import { getConverter2App, getConverter2Project } from "../programs.js";

function shouldIgnoreElement(el: JsxElement) {
    switch (el.tag) {
        case "svg":
        case "head":
        case "script":
        case "header":
        case "footer":
            return true;
        case "div":
            return [
                "site-menu",
                "overlay",
                "tsd-navigation settings",
            ].includes((el.props as any)?.["class"]);
    }

    return false;
}

function collapseStrings(data: any[]): unknown {
    let lastString = -1;
    for (let i = 0; i < data.length;) {
        if (typeof data[i] === "string") {
            if (lastString === -1) {
                lastString = i;
                ++i;
            } else {
                data[lastString] += data.splice(i, 1)[0];
            }
        } else {
            lastString = -1;
            ++i;
        }
    }
    if (data.length === 1) {
        return data[0];
    }
    return data;
}

function renderElementToSnapshot(element: JsxChildren): unknown {
    if (!element || typeof element === "boolean") {
        return "";
    }

    if (typeof element === "string" || typeof element === "number") {
        return element.toString();
    }

    if (Array.isArray(element)) {
        return collapseStrings(element.flatMap(renderElementToSnapshot).filter(Boolean));
    }

    if (shouldIgnoreElement(element)) {
        return;
    }

    const { tag, props, children } = element;

    if (typeof tag === "function") {
        if (tag === Raw) {
            return String((props as any).html);
        }
        if (tag === JsxFragment) {
            return collapseStrings(children.flatMap(renderElementToSnapshot).filter(Boolean));
        }
        return renderElementToSnapshot(tag(Object.assign({ children }, props)));
    }

    let name = tag;
    let propsData: Record<string, unknown> | undefined;
    let childrenData: unknown;

    for (const [key, val] of Object.entries(props ?? {})) {
        if (val == null) continue;
        if (key === "class") {
            name += "." + val.replaceAll(" ", ".");
            continue;
        }
        if (key === "id") {
            name += "#" + val;
            continue;
        }

        propsData ||= {};

        if (typeof val == "boolean") {
            propsData[key] = val;
        } else {
            propsData[key] = typeof val === "string" ? val : JSON.stringify(val);
        }
    }

    const collapsed = collapseStrings(children.flatMap(renderElementToSnapshot).filter(Boolean));
    if (Array.isArray(collapsed) || typeof collapsed === "string") {
        if (collapsed.length) {
            childrenData = collapsed;
        }
    } else if (typeof collapsed === "object") {
        childrenData = collapsed;
    }

    if (propsData) {
        return { tag: name, props: propsData, children: childrenData };
    }
    return { [name]: childrenData || [] };
}

export class TestTheme extends DefaultTheme {
    override render(page: PageEvent<Reflection>): string {
        const templateMapping: Record<string, any> = {
            [PageKind.Index]: this.indexTemplate,
            [PageKind.Document]: this.documentTemplate,
            [PageKind.Hierarchy]: this.hierarchyTemplate,
            [PageKind.Reflection]: this.reflectionTemplate,
        };
        const template = templateMapping[page.pageKind] as RenderTemplate<PageEvent<Reflection>>;

        const templateOutput = this.defaultLayoutTemplate(page, template);
        const snapshot = renderElementToSnapshot(templateOutput) as any;
        return JSON.stringify(snapshot.children.body, null, 4) + "\n";
    }

    override async preRender() {
        loadTestHighlighter();
    }
}

export class TestRouter extends KindRouter {
    override extension = ".json";
}

export async function buildRendererSpecs(specPath: string) {
    await rm(specPath, { recursive: true, force: true });

    const app2 = getConverter2App();
    app2.renderer.defineTheme("test-theme", TestTheme);
    app2.renderer.defineRouter("test-router", TestRouter);

    const snap = app2.options.snapshot();

    app2.options.setValue("options", "src/test/converter2/typedoc.json");
    await app2.options.read(app2.logger);

    app2.options.setValue("theme", "test-theme");
    app2.options.setValue("router", "test-router");
    // Unfortunate not to set this in typedoc.json for converter2, but plenty
    // of tests expect to test the default option, not this.
    app2.options.setValue("categorizeByGroup", true);

    resetReflectionID();
    const project = getConverter2Project(["renderer"], ".");
    project.readme = [{ kind: "text", text: "Readme text" }];
    await app2.generateDocs(project, specPath);
    await rm(`${specPath}/assets`, { recursive: true });
    await rm(`${specPath}/.nojekyll`);

    app2.renderer.removeTheme("test-theme");
    app2.renderer.removeRouter("test-router");
    app2.options.restore(snap);
}
