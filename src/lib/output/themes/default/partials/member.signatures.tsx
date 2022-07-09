import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { DeclarationReflection } from "../../../../models";
import { anchorIcon } from "./anchor-icon";

export const memberSignatures = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <ul class={"tsd-signatures " + props.cssClasses}>
            {props.signatures?.map((item) => (
                <>
                    <li class="tsd-signature tsd-anchor-link" id={item.anchor}>
                        {context.memberSignatureTitle(item)}
                        {anchorIcon(context, item.anchor)}
                    </li>
                    <li class="tsd-description">{context.memberSignatureBody(item)}</li>
                </>
            ))}
        </ul>
    </>
);
