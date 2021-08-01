import { classNames, wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { NavigationItem } from "../../../models/NavigationItem";

export const toc =
    ({ relativeURL, partials }: DefaultThemeRenderContext) =>
    (props: NavigationItem) =>
        (
            <li class={classNames({ current: props.isInPath }) + " " + props.cssClasses}>
                <a href={relativeURL(props.url)} class="tsd-kind-icon">
                    {wbr(props.title)}
                </a>
                {!!props.children && (
                    <ul>
                        {props.children.map((item) => (
                            <> {partials.toc(item)}</>
                        ))}
                    </ul>
                )}
            </li>
        );
