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
        <ul class="tsd-breadcrumb" aria-label="Breadcrumb">
            {path.reverse().map((r, index) => (
                <li>
                    <a href={context.urlTo(r)} aria-current={index === path.length - 1 ? "page" : undefined}>
                        {r.name}
                    </a>
                </li>
            ))}
        </ul>
    );
}
