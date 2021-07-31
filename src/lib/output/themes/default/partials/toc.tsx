import { classNames, wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { NavigationItem } from "../../../models/NavigationItem";

export const toc =
    ({ relativeURL, partials }: DefaultThemeRenderContext) =>
    (props: NavigationItem) =>
        (
            <>
                <li className={classNames({ current: props.isInPath }) + " " + props.cssClasses}>
                    <a href={relativeURL(props.url)} className="tsd-kind-icon">
                        {wbr(props.title)}
                    </a>
                    {!!props.children && (
                        <>
                            <ul>
                                {props.children.map((item) => (
                                    <> {partials.toc(item)}</>
                                ))}
                            </ul>
                        </>
                    )}
                </li>
            </>
        );
