import { ContainerReflection, DeclarationReflection, Reflection, ReflectionKind } from "../../../../models";
import { JSX, partition } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { camelToTitleCase, classNames, renderName, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function navigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    return (
        <>
            {context.sidebarLinks()}
            {context.settings()}
            {context.primaryNavigation(props)}
            {context.secondaryNavigation(props)}
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
                buildFilterItem(context, filterName, camelToTitleCase(key.substring(1)), defaultFilters[key])
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
                    <h3>{context.icons.chevronDown()} Settings</h3>
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
                        <select id="theme">
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

export function primaryNavigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    // Create the navigation for the current page

    const modules = props.model.project.getChildrenByKind(ReflectionKind.SomeModule);
    const [ext, int] = partition(modules, (m) => m.flags.isExternal);

    const selected = props.model.isProject();
    const current = selected || int.some((mod) => inPath(mod, props.model));

    return (
        <nav class="tsd-navigation primary">
            <details class="tsd-index-accordion" open={true}>
                <summary class="tsd-accordion-summary">
                    <h3>{context.icons.chevronDown()} Modules</h3>
                </summary>
                <div class="tsd-accordion-details">
                    <ul>
                        <li class={classNames({ current, selected })}>
                            <a href={context.urlTo(props.model.project)}>{wbr(props.project.name)}</a>
                            <ul>{int.map(link)}</ul>
                        </li>
                        {ext.map(link)}
                    </ul>
                </div>
            </details>
        </nav>
    );

    function link(mod: DeclarationReflection) {
        const current = inPath(mod, props.model);
        const selected = mod.name === props.model.name;
        let childNav: JSX.Element | undefined;
        const childModules = mod.children?.filter((m) => m.kindOf(ReflectionKind.SomeModule));
        if (childModules?.length) {
            childNav = <ul>{childModules.map(link)}</ul>;
        }

        return (
            <li class={classNames({ current, selected, deprecated: mod.isDeprecated() }, mod.cssClasses)}>
                <a href={context.urlTo(mod)}>
                    {wbr(`${mod.name}${mod.version !== undefined ? ` - v${mod.version}` : ""}`)}
                </a>
                {childNav}
            </li>
        );
    }
}

export function secondaryNavigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    // Multiple entry points, and on main project page.
    if (props.model.isProject() && props.model.getChildrenByKind(ReflectionKind.Module).length) {
        return;
    }

    const effectivePageParent =
        (props.model instanceof ContainerReflection && props.model.children?.length) || props.model.isProject()
            ? props.model
            : props.model.parent!;

    const children = (effectivePageParent as ContainerReflection).children || [];

    const pageNavigation = children
        .filter((child) => !child.kindOf(ReflectionKind.SomeModule))
        .map((child) => {
            return (
                <li
                    class={classNames(
                        { deprecated: child.isDeprecated(), current: props.model === child },
                        child.cssClasses
                    )}
                >
                    <a href={context.urlTo(child)} class="tsd-index-link">
                        {context.icons[child.kind]()}
                        {renderName(child)}
                    </a>
                </li>
            );
        });

    if (effectivePageParent.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)) {
        return (
            <nav class="tsd-navigation secondary menu-sticky">
                {!!pageNavigation.length && <ul>{pageNavigation}</ul>}
            </nav>
        );
    }

    return (
        <nav class="tsd-navigation secondary menu-sticky">
            <ul>
                <li
                    class={classNames(
                        {
                            deprecated: effectivePageParent.isDeprecated(),
                            current: effectivePageParent === props.model,
                        },
                        effectivePageParent.cssClasses
                    )}
                >
                    <a href={context.urlTo(effectivePageParent)} class="tsd-index-link">
                        {context.icons[effectivePageParent.kind]()}
                        <span>{renderName(effectivePageParent)}</span>
                    </a>
                    {!!pageNavigation.length && <ul>{pageNavigation}</ul>}
                </li>
            </ul>
        </nav>
    );
}

function inPath(thisPage: Reflection, toCheck: Reflection | undefined): boolean {
    while (toCheck) {
        if (toCheck.isProject()) return false;

        if (thisPage === toCheck) return true;

        toCheck = toCheck.parent;
    }
    return false;
}
