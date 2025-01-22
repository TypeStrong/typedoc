import { JSX } from "../../../../utils/index.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

export function persistentHeader(context: DefaultThemeRenderContext) {
    const customPersistentHeaderHtml = context.options.getValue(
        "customPersistentHeaderHtml",
    );
    let customPersistentHeaderDisplay = <></>;
    if (customPersistentHeaderHtml) {
        if (
            context.options.getValue("customPersistentHeaderHtmlDisableWrapper")
        ) {
            customPersistentHeaderDisplay = (
                <JSX.Raw html={customPersistentHeaderHtml} />
            );
        } else {
            customPersistentHeaderDisplay = (
                <p>
                    <JSX.Raw html={customPersistentHeaderHtml} />
                </p>
            );
        }
    }

    return (
        <persistentHeader>
            {context.hook("persistentHeader.begin", context)}
            {customPersistentHeaderDisplay}
            {context.hook("persistentHeader.end", context)}
        </persistentHeader>
    );
}
