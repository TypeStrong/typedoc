import { Reflection, ReflectionKind } from "../../../../models";
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
    const navLinks = Object.entries(context.options.getValue("navigationLinks"));

    if (!links.length && !navLinks.length) return null;
    return (
        <nav id="tsd-sidebar-links" class="tsd-navigation">
            {links.map(([label, url]) => (
                <a href={url}>{label}</a>
            ))}
            {navLinks.map(([label, url]) => (
                <a href={url} class="tsd-nav-link">
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
                        <select name="tsd-theme" id="tsd-theme">
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

export const navigation = function navigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    return (
        <nav class="tsd-navigation">
            <a href={context.urlTo(props.project)} class={classNames({ current: props.project === props.model })}>
                {context.icons[ReflectionKind.Project]()}
                <span>{getDisplayName(props.project)}</span>
            </a>
            <ul class="tsd-small-nested-navigation" id="tsd-nav-container" data-base={context.relativeURL("./")}>
                <li>Loading...</li>
            </ul>
        </nav>
    );
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

    function finalizeLevel(finishedHandlingHeadings: boolean) {
        const level = levels.pop()!;
        if (levels[levels.length - 1].length === 0 && finishedHandlingHeadings) {
            levels[levels.length - 1] = level;
            return;
        }

        const built = (
            <ul>
                {level.map((l) => (
                    <li>{l}</li>
                ))}
            </ul>
        );
        levels[levels.length - 1].push(built);
    }

    for (const heading of props.pageHeadings) {
        const inferredLevel = heading.level ? heading.level + 1 : 1;
        while (inferredLevel < levels.length) {
            finalizeLevel(false);
        }
        while (inferredLevel > levels.length) {
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
        finalizeLevel(true);
    }

    if (!levels[0].length) {
        return <></>;
    }

    levels.unshift([]);
    finalizeLevel(true);

    return (
        <details open={true} class="tsd-index-accordion tsd-page-navigation">
            <summary class="tsd-accordion-summary">
                <h3>
                    {context.icons.chevronDown()}
                    On This Page
                </h3>
            </summary>
            <div class="tsd-accordion-details">{levels[0]}</div>
        </details>
    );
}
