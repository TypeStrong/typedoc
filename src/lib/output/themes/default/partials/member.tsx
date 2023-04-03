import { classNames, getDisplayName, renderFlags, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import { DeclarationReflection, ReferenceReflection } from "../../../../models";
import { anchorIcon } from "./anchor-icon";

export function member(context: DefaultThemeRenderContext, props: DeclarationReflection) {
    context.page.pageHeadings.push({
        link: `#${props.anchor}`,
        text: getDisplayName(props),
        kind: props.kind,
        classes: context.getReflectionClasses(props),
    });

    return (
        <section class={classNames({ "tsd-panel": true, "tsd-member": true }, context.getReflectionClasses(props))}>
            <a id={props.anchor} class="tsd-anchor"></a>
            {!!props.name && (
                <h3 class="tsd-anchor-link">
                    {renderFlags(props.flags, props.comment)}
                    <span class={classNames({ deprecated: props.isDeprecated() })}>{wbr(props.name)}</span>
                    {anchorIcon(context, props.anchor)}
                </h3>
            )}
            {props.signatures
                ? context.memberSignatures(props)
                : props.hasGetterOrSetter()
                ? context.memberGetterSetter(props)
                : props instanceof ReferenceReflection
                ? context.memberReference(props)
                : context.memberDeclaration(props)}

            {props.groups?.map((item) => item.children.map((item) => !item.hasOwnDocument && context.member(item)))}
        </section>
    );
}
