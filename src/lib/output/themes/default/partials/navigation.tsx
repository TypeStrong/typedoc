import { wbr, classNames } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { NavigationItem } from "../../../models/NavigationItem";
export const navigation =
    ({ relativeURL, partials }: DefaultThemeRenderContext) =>
    (props: NavigationItem) =>
        Boolean(props.isVisible) &&
        (props.isLabel ? (
            <>
                <li className={"label " + props.cssClasses}>
                    <span>{wbr(props.title)}</span>
                </li>
            </>
        ) : (false as boolean) /*
        Conditional was:
        props.isGlobals
        ...but that is not declared anywhere in typedoc, so it was always false.
    */ ? (
            <>
                <li className={classNames({ globals: true, current: props.isInPath }) + " " + props.cssClasses}>
                    <a href={relativeURL(props.url)}>
                        <em>{wbr(props.title)}</em>
                    </a>
                </li>
            </>
        ) : (
            <>
                <li className={classNames({ current: props.isInPath }) + " " + props.cssClasses}>
                    <a href={relativeURL(props.url)}>{wbr(props.title)}</a>
                    {!!props.isInPath && !!props.children && (
                        <>
                            <ul>
                                {props.children.map((item) => (
                                    <> {partials.navigation(item)}</>
                                ))}
                            </ul>
                        </>
                    )}
                </li>
            </>
        ));
