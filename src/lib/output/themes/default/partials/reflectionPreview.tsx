import { DeclarationReflection, ReflectionKind, type Reflection, ReflectionType } from "../../../../models/index.js";
import { JSX } from "../../../../utils/index.js";
import { getKindClass, renderTypeParametersSignature } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

void JSX; // Trick TS into seeing this as used, the import is required.

export function reflectionPreview(context: DefaultThemeRenderContext, props: Reflection) {
    if (!(props instanceof DeclarationReflection)) return;

    // Each property of the interface will have a member rendered later on the page describing it, so generate
    // a type-like object with links to each member. Don't do this if we don't have any children as it will
    // generate a broken looking interface. (See TraverseCallback)
    if (props.kindOf(ReflectionKind.Interface) && props.children) {
        return (
            <div class="tsd-signature">
                <span class="tsd-signature-keyword">interface </span>
                <span class={getKindClass(props)}>{props.name}</span>
                {renderTypeParametersSignature(context, props.typeParameters)}{" "}
                {context.type(new ReflectionType(props), { topLevelLinks: true })}
            </div>
        );
    }
}
