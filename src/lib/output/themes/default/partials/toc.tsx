import { classNames, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import type { NavigationItem } from "../../../models/NavigationItem";

export const toc = (context: DefaultThemeRenderContext, props: NavigationItem) => (
    <li class={classNames({ current: props.isInPath }) + " " + props.cssClasses}>
        <a href={context.relativeURL(props.url)} class="tsd-kind-icon">
            {wbr(props.title)}
        </a>
        {!!props.children && <ul>{props.children.map((item) => context.toc(item))}</ul>}
    </li>
);
