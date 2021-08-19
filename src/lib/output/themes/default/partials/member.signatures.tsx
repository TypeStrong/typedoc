import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { DeclarationReflection } from "../../../../models";

export const memberSignatures = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <ul class={"tsd-signatures " + props.cssClasses}>
            {props.signatures?.map((item) => (
                <li class="tsd-signature tsd-kind-icon">{context.memberSignatureTitle(item)}</li>
            ))}
        </ul>

        <ul class="tsd-descriptions">
            {props.signatures?.map((item) => (
                <li class="tsd-description">{context.memberSignatureBody(item)}</li>
            ))}
        </ul>
    </>
);
