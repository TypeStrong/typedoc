import { classNames, getDisplayName, wbr } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "#utils";
import { type DeclarationReflection, type DocumentReflection } from "../../../../models/index.js";
import { anchorIcon } from "./anchor-icon.js";

export function member(context: DefaultThemeRenderContext, props: DeclarationReflection | DocumentReflection) {
    const anchor = context.getAnchor(props);

    context.page.pageHeadings.push({
        link: `#${anchor}`,
        text: getDisplayName(props),
        kind: props.kind,
        classes: context.getReflectionClasses(props),
    });

    // With the default url derivation, we'll never hit this case as documents are always placed into their
    // own pages. Handle it here in case someone creates a custom url scheme which embeds guides within the page.
    if (props.isDocument()) {
        return (
            <section class={classNames({ "tsd-panel": true, "tsd-member": true }, context.getReflectionClasses(props))}>
                {!!props.name && (
                    <h3 class="tsd-anchor-link" id={anchor}>
                        {context.reflectionFlags(props)}
                        <span class={classNames({ deprecated: props.isDeprecated() })}>{wbr(props.name)}</span>
                        {anchorIcon(context, anchor)}
                    </h3>
                )}
                <div class="tsd-comment tsd-typography">
                    <JSX.Raw html={context.markdown(props.content)} />
                </div>
            </section>
        );
    }

    return (
        <section class={classNames({ "tsd-panel": true, "tsd-member": true }, context.getReflectionClasses(props))}>
            {!!props.name && (
                <h3 class="tsd-anchor-link" id={anchor}>
                    {context.reflectionFlags(props)}
                    <span class={classNames({ deprecated: props.isDeprecated() })}>{wbr(props.name)}</span>
                    {anchorIcon(context, anchor)}
                </h3>
            )}
            {props.signatures
                ? context.memberSignatures(props)
                : props.hasGetterOrSetter()
                ? context.memberGetterSetter(props)
                : context.memberDeclaration(props)}

            {props.groups?.map((item) =>
                item.children.map((item) => !context.router.hasOwnDocument(item) && context.member(item))
            )}
        </section>
    );
}
