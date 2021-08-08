import { wbr, classNames } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { NavigationItem } from "../../../models/NavigationItem";

export function navigation({ relativeURL, partials }: DefaultThemeRenderContext, props: NavigationItem) {
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
            <a href={relativeURL(props.url)}>{wbr(props.title)}</a>
            {!!props.isInPath && !!props.children && <ul>{props.children.map((item) => partials.navigation(item))}</ul>}
        </li>
    );
}
