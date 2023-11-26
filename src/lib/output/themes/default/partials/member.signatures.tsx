import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { DeclarationReflection } from "../../../../models";
import { anchorIcon } from "./anchor-icon";
import { classNames } from "../../lib";

export const memberSignatures = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <ul class={classNames({ "tsd-signatures": true }, context.getReflectionClasses(props))}>
            {props.signatures?.map((item) => (
                <>
                    <li class="tsd-signature tsd-anchor-link">
                        <a id={item.anchor} class="tsd-anchor"></a>
                        {context.memberSignatureTitle(item)}
                        {anchorIcon(context, item.anchor)}
                    </li>
                    <li class="tsd-description">{context.memberSignatureBody(item)}</li>
                </>
            ))}
        </ul>
    </>
);
