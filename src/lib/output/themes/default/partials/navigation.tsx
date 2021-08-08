import { wbr, classNames } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import type { NavigationItem } from "../../../models/NavigationItem";

export function navigation(context: DefaultThemeRenderContext, props: NavigationItem) {
    if (!props.isVisible) return;

    if (props.isLabel) {
        return (
            <li class={"label " + props.cssClasses}>
                <span>{wbr(props.title)}</span>
            </li>
        );
    }

    return (
        <li class={classNames({ current: props.isInPath }) + " " + props.cssClasses}>
            <a href={context.relativeURL(props.url)}>{wbr(props.title)}</a>
            {!!props.isInPath && !!props.children && <ul>{props.children.map((item) => context.navigation(item))}</ul>}
        </li>
    );
}
