import type { Reflection } from "../../../../models";
import { JSX } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { classNames } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function footer(context: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    const hideLegend = context.options.getValue("hideLegend");
    const hideGenerator = context.options.getValue("hideGenerator");
    return (
        <>
            {!hideLegend && (
                <footer
                    class={classNames({
                        "with-border-bottom": !hideGenerator,
                    })}
                >
                    <div class="container">
                        <h2>Legend</h2>
                        <div class="tsd-legend-group">
                            {props.legend?.map((item) => (
                                <ul class="tsd-legend">
                                    {item.map((item) => (
                                        <li class={item.classes.join(" ")}>
                                            <span class="tsd-kind-icon">{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    </div>
                </footer>
            )}

            {!hideGenerator && (
                <div class="container tsd-generator">
                    <p>
                        {"Generated using "}
                        <a href="https://typedoc.org/" target="_blank">
                            TypeDoc
                        </a>
                    </p>
                </div>
            )}
        </>
    );
}
