import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "#utils";
import type { Reflection } from "../../../../models/index.js";

export function breadcrumbs(context: DefaultThemeRenderContext, props: Reflection): JSX.Element {
    const path: Reflection[] = [];
    let refl: Reflection = props;
    while (refl.parent) {
        path.push(refl);
        refl = refl.parent;
    }

    return (
        <ul class="tsd-breadcrumb">
            {path.reverse().map((r) => (
                <li>
                    <a href={context.urlTo(r)}>{r.name}</a>
                </li>
            ))}
        </ul>
    );
}
