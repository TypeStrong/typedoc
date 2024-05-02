import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function footer(context: DefaultThemeRenderContext) {
    const hideGenerator = context.options.getValue("hideGenerator");
    if (hideGenerator) return;

    const message = context.i18n.theme_generated_using_typedoc();

    // Only handles one occurrence, but that's all I expect...
    const index = message.indexOf("TypeDoc");
    let display: JSX.Element;
    if (index == -1) {
        display = <p class="tsd-generator">{message}</p>;
    } else {
        const pre = message.substring(0, index);
        const post = message.substring(index + "TypeDoc".length);
        display = (
            <p class="tsd-generator">
                {pre}
                <a href="https://typedoc.org/" target="_blank">
                    TypeDoc
                </a>
                {post}
            </p>
        );
    }

    return (
        <footer>
            {context.hook("footer.begin")}
            {hideGenerator || display}
            {context.hook("footer.end")}
        </footer>
    );
}
