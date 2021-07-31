import { wbr, classNames } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { NavigationItem } from "../../../../..";
export const tocRoot =
    ({ relativeURL, partials }: DefaultThemeRenderContext) =>
    (item: NavigationItem) =>
        (
            <li className={classNames({ current: item.isInPath }) + " " + item.cssClasses}>
                <a href={relativeURL(item.url)} className="tsd-kind-icon">
                    {wbr(item.title)}
                </a>
                {!!item.children && (
                    <ul>
                        {item.children.map((item) => (
                            <> {partials.toc(item)}</>
                        ))}
                    </ul>
                )}
            </li>
        );
