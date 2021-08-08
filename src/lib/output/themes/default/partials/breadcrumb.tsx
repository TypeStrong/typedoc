import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement, JSX } from "../../../../utils";
import type { Reflection } from "../../../../models";

export const breadcrumb = (context: DefaultThemeRenderContext, props: Reflection): JSX.Element | undefined =>
    props.parent ? (
        <>
            {context.breadcrumb(props.parent)}
            <li>{props.url ? <a href={context.relativeURL(props.url)}>{props.name}</a> : <span>{props.name}</span>}</li>
        </>
    ) : props.url ? (
        <li>
            <a href={context.relativeURL(props.url)}>{props.name}</a>
        </li>
    ) : undefined;
