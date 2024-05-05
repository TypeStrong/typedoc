import { classNames, getDisplayName, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import { type DeclarationReflection, type DocumentReflection, ReferenceReflection } from "../../../../models";
import { anchorIcon } from "./anchor-icon";

export function member(context: DefaultThemeRenderContext, props: DeclarationReflection | DocumentReflection) {
    context.page.pageHeadings.push({
        link: `#${props.anchor}`,
        text: getDisplayName(props),
        kind: props.kind,
        classes: context.getReflectionClasses(props),
    });

    // With the default url derivation, we'll never hit this case as documents are always placed into their
    // own pages. Handle it here in case someone creates a custom url scheme which embeds guides within the page.
    if (props.isDocument()) {
        return (
            <section class={classNames({ "tsd-panel": true, "tsd-member": true }, context.getReflectionClasses(props))}>
                <a id={props.anchor} class="tsd-anchor"></a>
                {!!props.name && (
                    <h3 class="tsd-anchor-link">
                        {context.reflectionFlags(props)}
                        <span class={classNames({ deprecated: props.isDeprecated() })}>{wbr(props.name)}</span>
                        {anchorIcon(context, props.anchor)}
                    </h3>
                )}
                <div class="tsd-comment tsd-typography">
                    <Raw html={context.markdown(props.content)} />
                </div>
            </section>
        );
    }

    return (
        <section class={classNames({ "tsd-panel": true, "tsd-member": true }, context.getReflectionClasses(props))}>
            <a id={props.anchor} class="tsd-anchor"></a>
            {!!props.name && (
                <h3 class="tsd-anchor-link">
                    {context.reflectionFlags(props)}
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
