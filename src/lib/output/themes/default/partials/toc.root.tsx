import { wbr, classNames } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { NavigationItem } from "../../../../..";

export const tocRoot = ({ relativeURL, partials }: DefaultThemeRenderContext, item: NavigationItem) => (
    <li class={classNames({ current: item.isInPath }) + " " + item.cssClasses}>
        <a href={relativeURL(item.url)} class="tsd-kind-icon">
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
