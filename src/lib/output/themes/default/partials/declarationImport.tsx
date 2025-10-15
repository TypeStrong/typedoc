import { type Reflection, ReflectionKind } from "#models";
import { JSX } from "#utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

function getValidIdentifier(name: string) {
    const lastSlash = name.lastIndexOf("/");
    if (lastSlash) {
        return name.substring(lastSlash + 1).replace(/[^a-z0-9]/gi, "_");
    }
    return name.replace(/[^a-z0-9]/gi, "_");
}

interface ImportInfo {
    packageName: string | undefined;
    importSpecifier: string;
    extra?: string;
}

function getImportInfo(refl: Reflection): ImportInfo | undefined {
    if (refl.isDocument()) return;

    // Reference is a module, produce a namespace import
    if (refl.kindOf(ReflectionKind.Project | ReflectionKind.Module)) {
        const packageName = refl.isProject() ? refl.packageName : refl.name;
        return {
            packageName,
            importSpecifier: `* as ${getValidIdentifier(packageName || refl.name)}`,
        };
    }

    // Simple case, directly within a module
    if (refl.parent?.kindOf(ReflectionKind.Project | ReflectionKind.Module)) {
        return {
            packageName: refl.parent.isProject() ? refl.parent.packageName : refl.parent.name,
            importSpecifier: `{ ${getValidIdentifier(refl.name)} }`,
        };
    }

    // More obnoxious case, inside a namespace somewhere
    const path: Reflection[] = [refl];
    let iter = refl;
    while (!iter.parent?.kindOf(ReflectionKind.Project | ReflectionKind.Project)) {
        iter = iter.parent!;
        path.push(iter);
    }

    return {
        packageName: iter.parent.isProject() ? iter.parent.packageName : iter.parent.name,
        importSpecifier: `{ ${getValidIdentifier(path[path.length - 1].name)} }`,
        extra: "// " + path.reverse().map(r => r.name).join("."),
    };
}

export function declarationImport(context: DefaultThemeRenderContext, refl: Reflection) {
    const info = getImportInfo(refl);

    if (info?.packageName) {
        const code = [`import ${info.importSpecifier} from "${info.packageName}"`];
        if (info.extra) {
            code.push(info.extra);
        }
        const html = context.markdown([
            { kind: "code", text: "```ts\n" + code.join("\n") + "\n```" },
        ]);

        return <JSX.Raw html={html} />;
    }
}
