import { ReflectionSymbolId } from "#models";
import { findPackageForPath, getQualifiedName, normalizePath, resolveDeclarationMaps } from "#node-utils";
import { type NormalizedPath } from "#utils";
import { relative } from "node:path";
import ts from "typescript";

let transientCount = 0;
const transientIds = new WeakMap<ts.Symbol, number>();

// Don't use this directly, use Context.createSymbolId instead.
export function createSymbolIdImpl(symbol: ts.Symbol, declaration?: ts.Declaration) {
    declaration ??= symbol.declarations?.[0];
    const tsSource = declaration?.getSourceFile().fileName ?? "";
    const sourceFileName = resolveDeclarationMaps(tsSource);
    let packageName: string;
    let packagePath: NormalizedPath;
    const packageInfo = findPackageForPath(tsSource);
    if (packageInfo) {
        let packageDir: string;
        [packageName, packageDir] = packageInfo;
        packagePath = normalizePath(relative(packageDir, sourceFileName));
    } else {
        packageName = ReflectionSymbolId.UNKNOWN_PACKAGE;
        packagePath = normalizePath(sourceFileName);
    }

    let qualifiedName: string;
    if (symbol.declarations?.some(ts.isSourceFile)) {
        qualifiedName = "";
    } else {
        qualifiedName = getQualifiedName(symbol, symbol.name);
    }
    const pos = declaration?.getStart() ?? Infinity;
    let transientId = NaN;
    if (symbol.flags & ts.SymbolFlags.Transient) {
        transientId = transientIds.get(symbol) ?? ++transientCount;
        transientIds.set(symbol, transientId);
    }

    const id = new ReflectionSymbolId({
        packageName,
        packagePath,
        qualifiedName,
    });
    id.pos = pos;
    id.transientId = transientId;
    id.fileName = normalizePath(sourceFileName);

    return id;
}
