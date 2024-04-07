import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function footer(context: DefaultThemeRenderContext) {
    const hideGenerator = context.options.getValue("hideGenerator");
    return (
        <footer>
            {context.hook("footer.begin")}
            {hideGenerator || (
                <p class="tsd-generator">
                    {"Generated using "}
                    <a href="https://typedoc.org/" target="_blank">
                        TypeDoc
                    </a>
                </p>
            )}
            {context.hook("footer.end")}
        </footer>
    );
}
