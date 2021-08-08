import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationReflection } from "../../../../models";

export const memberSignatures = ({ partials }: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <ul class={"tsd-signatures " + props.cssClasses}>
            {props.signatures?.map((item) => (
                <li class="tsd-signature tsd-kind-icon">{partials.memberSignatureTitle(item)}</li>
            ))}
        </ul>

        <ul class="tsd-descriptions">
            {props.signatures?.map((item) => (
                <li class="tsd-description">{partials.memberSignatureBody(item)}</li>
            ))}
        </ul>
    </>
);
