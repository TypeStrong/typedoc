import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationReflection } from "../../../../models";
export const memberGetterSetter = ({ partials }: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <ul class={"tsd-signatures " + props.cssClasses}>
            {!!props.getSignature && (
                <li class="tsd-signature tsd-kind-icon">
                    <span class="tsd-signature-symbol">get</span> {props.name}
                    {partials.memberSignatureTitle(props.getSignature, { hideName: true })}
                </li>
            )}
            {!!props.setSignature && (
                <li class="tsd-signature tsd-kind-icon">
                    <span class="tsd-signature-symbol">set</span> {props.name}
                    {partials.memberSignatureTitle(props.setSignature, { hideName: true })}
                </li>
            )}
        </ul>

        <ul class="tsd-descriptions">
            {!!props.getSignature && (
                <li class="tsd-description">{partials.memberSignatureBody(props.getSignature)}</li>
            )}
            {!!props.setSignature && (
                <li class="tsd-description">{partials.memberSignatureBody(props.setSignature)}</li>
            )}
        </ul>
    </>
);
