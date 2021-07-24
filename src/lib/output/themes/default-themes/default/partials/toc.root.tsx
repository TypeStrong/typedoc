import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown, classNames } from "../../lib";
import * as React from "react";
import { NavigationItem } from "../../../../../..";
export const tocRoot = (item: NavigationItem) => (
    <>
        {/* {{#if isInPath*/}
        {/*    </ul> */}
        {/*    <ul class="current"> */}
        {/* {{/if*/}
        <li className={classNames({current: item.isInPath}) + item.cssClasses}>
            <a href={relativeURL(item.url)} className="tsd-kind-icon">
                {wbr(item.title)}
            </a>
            {!!item.children && (
                <>
                    {" "}
                    <ul>
                        {item.children.map((item, i) => (
                            <> {__partials__.toc(item)}</>
                        ))}{" "}
                    </ul>
                </>
            )}
        </li>
        {/* {{#if isInPath*/}
        {/*     </ul> */}
        {/*     <ul class="after-current"> */}
        {/* {{/if*/}
    </>
);
