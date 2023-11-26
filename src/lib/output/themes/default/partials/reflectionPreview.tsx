import { DeclarationReflection, ReflectionKind, type Reflection, ReflectionType } from "../../../../models";
import { JSX } from "../../../../utils";
import { getKindClass } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function reflectionPreview(context: DefaultThemeRenderContext, props: Reflection) {
    if (!(props instanceof DeclarationReflection)) return;

    // Each property of the interface will have a member rendered later on the page describing it, so generate
    // a type-like object with links to each member.
    if (props.kindOf(ReflectionKind.Interface)) {
        return (
            <div class="tsd-signature">
                <span class="tsd-signature-keyword">interface </span>
                <span class={getKindClass(props)}>{props.name} </span>
                {context.type(new ReflectionType(props), { topLevelLinks: true })}
            </div>
        );
    }
}
