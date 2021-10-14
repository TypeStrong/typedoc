import { ContainerReflection, DeclarationReflection, Reflection, ReflectionKind } from "../../../../models";
import { JSX, partition } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { classNames, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { icons } from "./icon";

export function navigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    return (
        <>
            {primaryNavigation(context, props)}
            {secondaryNavigation(context, props)}
        </>
    );
}

function primaryNavigation(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    // Create the navigation for the current page:
    // If there are modules marked as "external" then put them in their own group.

    const modules = props.model.project.getChildrenByKind(ReflectionKind.SomeModule);
    const [ext, int] = partition(modules, (m) => m.flags.isExternal);

    if (ext.length === 0) {
        return (
            <nav class="tsd-navigation primary">
                <ul>
                    {int.map(link)}
                </ul>
            </nav>
        );
    }

    const selected = props.model.isProject();
    const current = selected || int.some(mod => inPath(mod, props.model));

    return (
        <nav class="tsd-navigation primary">
            <ul>
                <li class={classNames({ current, selected })}>
                    <a href={context.urlTo(props.model.project)}>{wbr(props.project.name)}</a>
                    <ul>
                        {int.map(link)}
                    </ul>
                </li>
                {ext.map(link)}
            </ul>
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
                                {wbr(child.name)}
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
                        {wbr(props.model.name)}
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
