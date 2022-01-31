import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function footer(context: DefaultThemeRenderContext) {
    const hideGenerator = context.options.getValue("hideGenerator");
    if (!hideGenerator)
        return (
            <div class="container tsd-generator">
                <p>
                    {"Generated using "}
                    <a href="https://typedoc.org/" target="_blank">
                        TypeDoc
                    </a>
                </p>
            </div>
        );
}
