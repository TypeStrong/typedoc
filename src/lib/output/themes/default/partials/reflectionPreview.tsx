import { DeclarationReflection, ReflectionKind, type Reflection } from "../../../../models/index.js";
import { JSX } from "../../../../utils/index.js";
import { FormattedCodeBuilder, FormattedCodeGenerator, Wrap } from "../../../formatter.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

void JSX; // Trick TS into seeing this as used, the import is required.

export function reflectionPreview(context: DefaultThemeRenderContext, props: Reflection) {
    if (!(props instanceof DeclarationReflection)) return;

    // Each property of the interface will have a member rendered later on the page describing it, so generate
    // a type-like object with links to each member. Don't do this if we don't have any children as it will
    // generate a broken looking interface. (See TraverseCallback)
    if (props.kindOf(ReflectionKind.Interface) && props.children) {
        const builder = new FormattedCodeBuilder(context.urlTo);
        const tree = builder.interface(props);
        // Pass infinity to force properties onto new lines
        const generator = new FormattedCodeGenerator(undefined, Infinity);
        generator.node(tree, Wrap.Enable);

        return <div class="tsd-signature">{generator.toElement()}</div>;
    }
}
