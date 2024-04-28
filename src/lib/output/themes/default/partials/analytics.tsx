import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "../../../../utils/index.js";

export function analytics(context: DefaultThemeRenderContext) {
    const gaID = context.options.getValue("gaID");
    if (!gaID) return;

    const script = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaID}');
`.trim();

    return (
        <>
            <script async src={"https://www.googletagmanager.com/gtag/js?id=" + gaID}></script>
            <script>
                <JSX.Raw html={script} />
            </script>
        </>
    );
}
