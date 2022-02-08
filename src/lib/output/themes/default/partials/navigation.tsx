import { ContainerReflection, DeclarationReflection, Reflection, ReflectionKind } from "../../../../models";
import { JSX, partition } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { classNames, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { icons } from "./icon";

export function navigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    return (
        <>
            {settings()}
            {primaryNavigation(context, props)}
            {secondaryNavigation(context, props)}
        </>
    );
}

function settings() {
    // Settings panel above navigation

    const visibilityOptions = ["protected", "private", "inherited"].map((name) => {
        const value = name.charAt(0).toUpperCase() + name.slice(1);
        return (
            <li class="tsd-filter-item">
                <label class="tsd-filter-input">
                    <input type="checkbox" id={`tsd-filter-${name}`} name={name} value={value} />
                    {icons.checkbox()}
                    <span>{value}</span>
                </label>
            </li>
        );
    });
    return (
        <div class="tsd-navigation settings">
            <details class="tsd-index-accordion" open={false}>
                <summary class="tsd-accordion-summary">
                    <h3>{icons.chevronDown()} Settings</h3>
                </summary>
                <div class="tsd-accordion-details">
                    <div class="tsd-filter-visibility">
                        <h4 class="uppercase">Member Visibility</h4>
                        <form>
                            <ul id="tsd-filter-options">{...visibilityOptions}</ul>
                        </form>
                    </div>
                </div>
                <div class="tsd-theme-toggle">
                    <h4 class="uppercase">Theme</h4>
                    <select id="theme">
                        <option value="os">OS</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>{" "}
            </details>
        </div>
    );
}

function primaryNavigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    // Create the navigation for the current page

    const modules = props.model.project.getChildrenByKind(ReflectionKind.SomeModule);
    const [ext, int] = partition(modules, (m) => m.flags.isExternal);

    const selected = props.model.isProject();
    const current = selected || int.some((mod) => inPath(mod, props.model));

    return (
        <nav class="tsd-navigation primary">
            <details class="tsd-index-accordion" open={true}>
                <summary class="tsd-accordion-summary">
                    <h3>{icons.chevronDown()} Modules</h3>
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
            <li class={classNames({ current, selected }) + " " + mod.cssClasses}>
                <a href={context.urlTo(mod)}>{wbr(mod.name)}</a>
                {childNav}
            </li>
        );
    }
}

function secondaryNavigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    const children = props.model instanceof ContainerReflection ? props.model.children || [] : [];

    // Multiple entry points, and on main project page.
    if (props.model.isProject() && props.model.getChildrenByKind(ReflectionKind.Module).length) {
        return;
    }

    // TODO: TypeDoc 0.21 did special things here. If there were more than 40
    // children of this page's parent, it only displayed this page's children.
    // Otherwise, it displayed *everything*. For now, only display page children.
    // It seems weird to do this according to a random hardcoded number. At the very
    // least this should be added as a configurable flag, but maybe even the whole
    // behavior should be configurable globally...

    const pageNavigation = (
        <ul>
            {children
                .filter((child) => !child.kindOf(ReflectionKind.SomeModule))
                .map((child) => {
                    return (
                        <li class={child.cssClasses}>
                            <a href={context.urlTo(child)} class="tsd-index-link">
                                {icons[child.kind]()}
                                <span>{wbr(child.name)}</span>
                            </a>
                        </li>
                    );
                })}
        </ul>
    );

    if (props.model.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)) {
        return <nav class="tsd-navigation secondary menu-sticky">{pageNavigation}</nav>;
    }

    return (
        <nav class="tsd-navigation secondary menu-sticky">
            <ul>
                <li class={"current " + props.model.cssClasses}>
                    <a href={context.urlTo(props.model)} class="tsd-index-link">
                        {icons[props.model.kind]()}
                        <span>{wbr(props.model.name)}</span>
                    </a>
                    {pageNavigation}
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
