import { wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ContainerReflection, ReflectionCategory } from "../../../../models";
import { icons } from "./icon";

function renderCategory({ urlTo }: DefaultThemeRenderContext, item: ReflectionCategory, prependName = "") {
    return (
        <section class="tsd-index-section">
            <h3 class="tsd-index-heading" role="button" aria-expanded="false" tabIndex={0}>{icons.chevronDown()} {prependName ? `${prependName} ${item.title}` : item.title}</h3>
            <ul class="tsd-index-list" aria-hidden="true">
                {item.children.map((item) => (
                    <li class={item.cssClasses}>
                        <a href={urlTo(item)}>
                            {icons[item.kind]()}
                            {item.name ? wbr(item.name) : <em>{wbr(item.kindString!)}</em>}
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export function index(context: DefaultThemeRenderContext, props: ContainerReflection) {
    if (props.categories && props.categories.length) {
        return (
            <section class="tsd-panel-group tsd-index-group">
                <section class="tsd-panel tsd-index-panel">
                    <div class="tsd-index-content">{props.categories.map((item) => renderCategory(context, item))}</div>
                </section>
            </section>
        );
    }

    if (props.groups && props.groups.length) {
        return (
            <section class="tsd-panel-group tsd-index-group">
                <section class="tsd-panel tsd-index-panel">
                    <div class="tsd-index-content">
                        {props.groups.map((item) => (
                            <section class={"tsd-index-section " + item.cssClasses}>
                                {item.categories ? (
                                    item.categories.map((item2) => renderCategory(context, item2, item.title))
                                ) : (
                                    <>
                                        <h3 class="tsd-index-heading" role="button" aria-expanded="false" tabIndex={0}>{icons.chevronDown()} {item.title}</h3>
                                        <ul class="tsd-index-list" aria-hidden="true">
                                            {item.children.map((item) => (
                                                <li class={item.cssClasses}>
                                                    <a href={context.urlTo(item)} class="tsd-index-link">
                                                        {icons[item.kind]()}
                                                        {item.name ? wbr(item.name) : <em>{wbr(item.kindString!)}</em>}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </section>
                        ))}
                    </div>
                </section>
            </section>
        );
    }
}
