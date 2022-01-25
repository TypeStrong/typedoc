import { wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ContainerReflection, ReflectionCategory } from "../../../../models";
import { icons } from "./icon";

function renderCategory({ urlTo }: DefaultThemeRenderContext, item: ReflectionCategory, prependName = "") {
    return (
        <section class="tsd-index-section">
            <details class="tsd-index-accordion" open={true}>
                <summary class="tsd-accordion-summary tsd-index-summary">
                    <h3 class="tsd-index-heading" role="button" aria-expanded="false" tabIndex={0}>{icons.chevronDown()} {prependName ? `${prependName} ${item.title}` : item.title}</h3>
                </summary>
                <div class="tsd-accordion-details tsd-index-list">
                    {item.children.map((item) => (
                        <a href={urlTo(item)} class={"tsd-index-link " + item.cssClasses}>
                            {icons[item.kind]()}
                            <span>{item.name ? wbr(item.name) : <em>{wbr(item.kindString!)}</em>}</span>
                        </a>
                    ))}
                </div>
            </details>
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
                            item.categories ? (
                                <section class={"tsd-index-section " + item.cssClasses}>
                                    {item.categories.map((item2) => renderCategory(context, item2, item.title))}
                                </section>
                            ) : renderCategory(context, item)
                        ))}
                    </div>
                </section>
            </section>
        );
    }
}
