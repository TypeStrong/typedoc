import {
    DeclarationReflection,
    ProjectReflection,
    Reflection,
    ReflectionCategory,
    ReflectionGroup,
    ReflectionKind,
} from "../../../../models";
import { JSX } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { camelToTitleCase, classNames, getDisplayName, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function sidebar(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    return (
        <>
            {context.sidebarLinks()}
            {context.navigation(props)}
        </>
    );
}

function buildFilterItem(context: DefaultThemeRenderContext, name: string, displayName: string, defaultValue: boolean) {
    return (
        <li class="tsd-filter-item">
            <label class="tsd-filter-input">
                <input type="checkbox" id={`tsd-filter-${name}`} name={name} checked={defaultValue} />
                {context.icons.checkbox()}
                <span>{displayName}</span>
            </label>
        </li>
    );
}

export function sidebarLinks(context: DefaultThemeRenderContext) {
    const links = Object.entries(context.options.getValue("sidebarLinks"));
    if (!links.length) return null;
    return (
        <nav id="tsd-sidebar-links" class="tsd-navigation">
            {links.map(([label, url]) => (
                <a href={url} target="_blank">
                    {label}
                </a>
            ))}
        </nav>
    );
}

export function settings(context: DefaultThemeRenderContext) {
    const defaultFilters = context.options.getValue("visibilityFilters") as Record<string, boolean>;

    const visibilityOptions: JSX.Element[] = [];

    for (const key of Object.keys(defaultFilters)) {
        if (key.startsWith("@")) {
            const filterName = key
                .substring(1)
                .replace(/([a-z])([A-Z])/g, "$1-$2")
                .toLowerCase();

            visibilityOptions.push(
                buildFilterItem(context, filterName, camelToTitleCase(key.substring(1)), defaultFilters[key]),
            );
        } else if (
            (key === "protected" && !context.options.getValue("excludeProtected")) ||
            (key === "private" && !context.options.getValue("excludePrivate")) ||
            (key === "external" && !context.options.getValue("excludeExternals")) ||
            key === "inherited"
        ) {
            visibilityOptions.push(buildFilterItem(context, key, camelToTitleCase(key), defaultFilters[key]));
        }
    }

    // Settings panel above navigation

    return (
        <div class="tsd-navigation settings">
            <details class="tsd-index-accordion" open={false}>
                <summary class="tsd-accordion-summary">
                    <h3>
                        {context.icons.chevronDown()}
                        Settings
                    </h3>
                </summary>
                <div class="tsd-accordion-details">
                    {visibilityOptions.length && (
                        <div class="tsd-filter-visibility">
                            <h4 class="uppercase">Member Visibility</h4>
                            <form>
                                <ul id="tsd-filter-options">{...visibilityOptions}</ul>
                            </form>
                        </div>
                    )}
                    <div class="tsd-theme-toggle">
                        <h4 class="uppercase">Theme</h4>
                        <select id="tsd-theme">
                            <option value="os">OS</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                </div>
            </details>
        </div>
    );
}

type NavigationElement = ReflectionCategory | ReflectionGroup | DeclarationReflection;

function shouldShowCategories(reflection: Reflection, opts: { includeCategories: boolean; includeGroups: boolean }) {
    if (opts.includeCategories) {
        return !reflection.comment?.hasModifier("@hideCategories");
    }
    return reflection.comment?.hasModifier("@showCategories") === true;
}

function shouldShowGroups(reflection: Reflection, opts: { includeCategories: boolean; includeGroups: boolean }) {
    if (opts.includeGroups) {
        return !reflection.comment?.hasModifier("@hideGroups");
    }
    return reflection.comment?.hasModifier("@showGroups") === true;
}

const getNavigationElements = function getNavigationElements(
    parent: NavigationElement | ProjectReflection,
    opts: { includeCategories: boolean; includeGroups: boolean },
): undefined | readonly NavigationElement[] {
    if (parent instanceof ReflectionCategory) {
        return parent.children;
    }

    if (parent instanceof ReflectionGroup) {
        if (shouldShowCategories(parent.owningReflection, opts) && parent.categories) {
            return parent.categories;
        }
        return parent.children;
    }

    if (!parent.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)) {
        return;
    }

    if (parent.categories && shouldShowCategories(parent, opts)) {
        return parent.categories;
    }

    if (parent.groups && shouldShowGroups(parent, opts)) {
        return parent.groups;
    }

    return parent.children;
};

export const navigation = function navigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    const opts = context.options.getValue("navigation");
    // Create the navigation for the current page
    // Recurse to children if the parent is some kind of module

    return (
        <nav class="tsd-navigation">
            {createNavElement(props.project)}
            <ul class="tsd-small-nested-navigation">
                {getNavigationElements(props.project, opts)?.map((c) => <li>{links(c, [])}</li>)}
            </ul>
        </nav>
    );

    function links(mod: NavigationElement, parents: string[]) {
        const nameClasses = classNames(
            { deprecated: mod instanceof Reflection && mod.isDeprecated() },
            mod instanceof DeclarationReflection ? context.getReflectionClasses(mod) : void 0,
        );

        const children = getNavigationElements(mod, opts);

        if (!children || (!opts.fullTree && mod instanceof Reflection && !inPath(mod))) {
            return createNavElement(mod, nameClasses);
        }

        const childParents = mod instanceof Reflection ? [mod.getFullName()] : [...parents, mod.title];

        return (
            <details
                class={classNames({ "tsd-index-accordion": true }, nameClasses)}
                open={mod instanceof Reflection && inPath(mod)}
                data-key={childParents.join("$")}
            >
                <summary class="tsd-accordion-summary">
                    {context.icons.chevronDown()}
                    {createNavElement(mod)}
                </summary>
                <div class="tsd-accordion-details">
                    <ul class="tsd-nested-navigation">
                        {children.map((c) => (
                            <li>{links(c, childParents)}</li>
                        ))}
                    </ul>
                </div>
            </details>
        );
    }

    function createNavElement(child: NavigationElement | ProjectReflection, nameClasses?: string) {
        if (child instanceof Reflection) {
            return (
                <a href={context.urlTo(child)} class={classNames({ current: child === props.model }, nameClasses)}>
                    {context.icons[child.kind]()}
                    <span>{wbr(getDisplayName(child))}</span>
                </a>
            );
        }

        return <span>{child.title}</span>;
    }

    function inPath(mod: DeclarationReflection | ProjectReflection) {
        let iter: Reflection | undefined = props.model;
        do {
            if (iter == mod) return true;
            iter = iter.parent;
        } while (iter);
        return false;
    }
};

export function pageSidebar(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    return (
        <>
            {context.settings()}
            {context.pageNavigation(props)}
        </>
    );
}

export function pageNavigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    const levels: JSX.Element[][] = [[]];

    function finalizeLevel() {
        const built = (
            <ul>
                {levels.pop()!.map((l) => (
                    <li>{l}</li>
                ))}
            </ul>
        );
        levels[levels.length - 1].push(built);
    }

    for (const heading of props.pageHeadings) {
        const inferredLevel = heading.level ? heading.level + 1 : 1;
        while (inferredLevel < levels.length) {
            finalizeLevel();
        }
        if (inferredLevel > levels.length) {
            // Lower level than before
            levels.push([]);
        }

        levels[levels.length - 1].push(
            <a href={heading.link} class={heading.classes}>
                {heading.kind && context.icons[heading.kind]()}
                <span>{wbr(heading.text)}</span>
            </a>,
        );
    }

    while (levels.length > 1) {
        finalizeLevel();
    }

    if (!levels[0].length) {
        return <></>;
    }

    return (
        <details open={true} class="tsd-index-accordion tsd-page-navigation">
            <summary class="tsd-accordion-summary">
                <h3>
                    {context.icons.chevronDown()}
                    On This Page
                </h3>
            </summary>
            <div class="tsd-accordion-details">
                <ul>
                    {levels[0].map((l) => (
                        <li>{l}</li>
                    ))}
                </ul>
            </div>
        </details>
    );
}
