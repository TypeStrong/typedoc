import { wbr, classNames } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { NavigationItem } from "../../../../..";

export const tocRoot = (context: DefaultThemeRenderContext, item: NavigationItem) => (
    <li class={classNames({ current: item.isInPath }) + " " + item.cssClasses}>
        <a href={context.relativeURL(item.url)} class="tsd-kind-icon">
            {wbr(item.title)}
        </a>
        {!!item.children && <ul>{item.children.map((item) => context.toc(item))}</ul>}
    </li>
);
