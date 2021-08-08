import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement, JSX } from "../../../../utils";
import { Reflection } from "../../../../models";
export const breadcrumb = (
    { relativeURL, partials }: DefaultThemeRenderContext,
    props: Reflection
): JSX.Element | undefined =>
    props.parent ? (
        <>
            {partials.breadcrumb(props.parent)}
            <li>{props.url ? <a href={relativeURL(props.url)}>{props.name}</a> : <span>{props.name}</span>}</li>
        </>
    ) : props.url ? (
        <li>
            <a href={relativeURL(props.url)}>{props.name}</a>
        </li>
    ) : undefined;
