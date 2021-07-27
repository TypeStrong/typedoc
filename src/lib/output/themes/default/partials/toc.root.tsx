import { relativeURL, wbr, __partials__, classNames } from "../../lib";
import * as React from "react";
import { NavigationItem } from "../../../../..";
export const tocRoot = (item: NavigationItem) => (
    <li className={classNames({current: item.isInPath}) + ' ' + item.cssClasses}>
        <a href={relativeURL(item.url)} className="tsd-kind-icon">
            {wbr(item.title)}
        </a>
        {!!item.children && (
            <>
                {" "}
                <ul>
                    {item.children.map((item) => (
                        <> {__partials__.toc(item)}</>
                    ))}{" "}
                </ul>
            </>
        )}
    </li>
);
