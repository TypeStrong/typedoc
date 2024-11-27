import type { DefaultThemeRenderContext } from "../index.js";
import {
    type CommentDisplayPart,
    type ContainerReflection,
    DeclarationReflection,
    type DocumentReflection,
    ProjectReflection,
    ReferenceReflection,
    type Reflection,
    ReflectionKind,
    SignatureReflection,
    type TypeParameterReflection,
} from "../../models/index.js";
import { DefaultMap, filterMap, JSX } from "../../utils/index.js";

export function stringify(data: unknown) {
    if (typeof data === "bigint") {
        return data.toString() + "n";
    }
    return JSON.stringify(data);
}

export function getDisplayName(refl: Reflection): string {
    let version = "";
    if ((refl instanceof DeclarationReflection || refl instanceof ProjectReflection) && refl.packageVersion) {
        version = ` - v${refl.packageVersion}`;
    }

    return `${refl.name}${version}`;
}

export function toStyleClass(str: string): string {
    return str.replace(/(\w)([A-Z])/g, (_m, m1: string, m2: string) => m1 + "-" + m2).toLowerCase();
}

export function getKindClass(refl: Reflection): string {
    if (refl instanceof ReferenceReflection) {
        return getKindClass(refl.getTargetReflectionDeep());
    }
    return ReflectionKind.classString(refl.kind);
}

/**
 * Insert word break tags ``<wbr>`` into the given string.
 *
 * Breaks the given string at ``_``, ``-`` and capital letters.
 *
 * @param str The string that should be split.
 * @return The original string containing ``<wbr>`` tags where possible.
 */
export function wbr(str: string): (string | JSX.Element)[] {
    // TODO surely there is a better way to do this, but I'm tired.
    const ret: (string | JSX.Element)[] = [];
    const re = /[\s\S]*?(?:[^_-][_-](?=[^_-])|[^A-Z](?=[A-Z][^A-Z]))/g;
    let match: RegExpExecArray | null;
    let i = 0;
    while ((match = re.exec(str))) {
        ret.push(match[0], <wbr />);
        i += match[0].length;
    }
    ret.push(str.slice(i));

    return ret;
}

export function join<T>(joiner: JSX.Children, list: readonly T[], cb: (x: T) => JSX.Children) {
    const result: JSX.Children = [];

    for (const item of list) {
        if (result.length > 0) {
            result.push(joiner);
        }
        result.push(cb(item));
    }

    return <>{result}</>;
}

export function classNames(names: Record<string, boolean | null | undefined>, extraCss?: string) {
    const css = Object.keys(names)
        .filter((key) => names[key])
        .concat(extraCss || "")
        .join(" ")
        .trim()
        .replace(/\s+/g, " ");
    return css.length ? css : undefined;
}

export function hasTypeParameters(
    reflection: Reflection,
): reflection is Reflection & { typeParameters: TypeParameterReflection[] } {
    return (
        (reflection instanceof DeclarationReflection || reflection instanceof SignatureReflection) &&
        reflection.typeParameters != null &&
        reflection.typeParameters.length > 0
    );
}

export function renderTypeParametersSignature(
    context: DefaultThemeRenderContext,
    typeParameters: readonly TypeParameterReflection[] | undefined,
): JSX.Element {
    if (!typeParameters || typeParameters.length === 0) return <></>;
    const hideParamTypes = false; // context.options.getValue("hideTypesInSignatureTitle");

    if (hideParamTypes) {
        return (
            <>
                <span class="tsd-signature-symbol">{"<"}</span>
                {join(<span class="tsd-signature-symbol">{", "}</span>, typeParameters, (item) => (
                    <>
                        {item.flags.isConst && <span class="tsd-signature-keyword">const </span>}
                        {item.varianceModifier ? `${item.varianceModifier} ` : ""}
                        <a class="tsd-signature-type tsd-kind-type-parameter" href={context.urlTo(item)}>
                            {item.name}
                        </a>
                    </>
                ))}
                <span class="tsd-signature-symbol">{">"}</span>
            </>
        );
    }

    return (
        <>
            <span class="tsd-signature-symbol">{"<"}</span>
            {join(<span class="tsd-signature-symbol">{", "}</span>, typeParameters, (item) => (
                <>
                    {item.flags.isConst && "const "}
                    {item.varianceModifier ? `${item.varianceModifier} ` : ""}
                    <span class="tsd-signature-type tsd-kind-type-parameter">{item.name}</span>
                    {!!item.type && (
                        <>
                            <span class="tsd-signature-keyword"> extends </span>
                            {context.type(item.type)}
                        </>
                    )}
                </>
            ))}
            <span class="tsd-signature-symbol">{">"}</span>
        </>
    );
}

/**
 * Renders the reflection name with an additional `?` if optional.
 */
export function renderName(refl: Reflection) {
    if (refl.flags.isOptional) {
        return <>{wbr(refl.name)}?</>;
    }

    return wbr(refl.name);
}

// This is cached to avoid slowness with large projects.
const rootsCache = new WeakMap<ProjectReflection, DeclarationReflection[]>();
export function getHierarchyRoots(project: ProjectReflection): DeclarationReflection[] {
    const cached = rootsCache.get(project);
    if (cached) return cached;

    const allClasses = project.getReflectionsByKind(ReflectionKind.ClassOrInterface) as DeclarationReflection[];

    const roots = allClasses.filter((refl) => {
        // If nobody extends this class, there's no possible hierarchy to display.
        if (!refl.implementedBy && !refl.extendedBy) {
            return false;
        }

        // If we don't extend anything, then we are a root
        if (!refl.implementedTypes && !refl.extendedTypes) {
            return true;
        }

        // We might still be a root, if our extended/implemented types are not included
        // in the documentation.
        const types = [...(refl.implementedTypes || []), ...(refl.extendedTypes || [])];

        return types.every(
            (type) =>
                !type.visit({
                    reference(ref) {
                        return ref.reflection !== undefined;
                    },
                }),
        );
    });

    const result = roots.sort((a, b) => a.name.localeCompare(b.name));
    rootsCache.set(project, result);
    return result;
}

export interface MemberSections {
    title: string;
    description?: CommentDisplayPart[];
    children: Array<DocumentReflection | DeclarationReflection>;
}

export function getMemberSections(
    parent: ContainerReflection,
    childFilter: (refl: Reflection) => boolean = () => true,
): MemberSections[] {
    if (parent.categories?.length) {
        return filterMap(parent.categories, (cat) => {
            const children = cat.children.filter(childFilter);
            if (!children.length) return;
            return {
                title: cat.title,
                description: cat.description,
                children,
            };
        });
    }

    if (parent.groups?.length) {
        return parent.groups.flatMap((group) => {
            if (group.categories?.length) {
                return filterMap(group.categories, (cat) => {
                    const children = cat.children.filter(childFilter);
                    if (!children.length) return;
                    return {
                        title: `${group.title} - ${cat.title}`,
                        description: cat.description,
                        children,
                    };
                });
            }

            const children = group.children.filter(childFilter);
            if (!children.length) return [];
            return {
                title: group.title,
                description: group.description,
                children,
            };
        });
    }

    return [];
}

const nameCollisionCache = new WeakMap<ProjectReflection, DefaultMap<string, number>>();
function getNameCollisionCount(project: ProjectReflection, name: string): number {
    let collisions = nameCollisionCache.get(project);
    if (collisions === undefined) {
        collisions = new DefaultMap(() => 0);
        for (const reflection of project.getReflectionsByKind(ReflectionKind.SomeExport)) {
            collisions.set(reflection.name, collisions.get(reflection.name) + 1);
        }
        nameCollisionCache.set(project, collisions);
    }
    return collisions.get(name);
}

function getNamespacedPath(reflection: Reflection): Reflection[] {
    const path = [reflection];
    let parent = reflection.parent;
    while (parent?.kindOf(ReflectionKind.Namespace)) {
        path.unshift(parent);
        parent = parent.parent;
    }
    return path;
}

/**
 * Returns a (hopefully) globally unique path for the given reflection.
 *
 * This only works for exportable symbols, so e.g. methods are not affected by this.
 *
 * If the given reflection has a globally unique name already, then it will be returned as is. If the name is
 * ambiguous (i.e. there are two classes with the same name in different namespaces), then the namespaces path of the
 * reflection will be returned.
 */
export function getUniquePath(reflection: Reflection): Reflection[] {
    if (reflection.kindOf(ReflectionKind.SomeExport)) {
        if (getNameCollisionCount(reflection.project, reflection.name) >= 2) {
            return getNamespacedPath(reflection);
        }
    }
    return [reflection];
}
