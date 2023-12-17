import type { DeclarationReflection } from "../../../../models";
import { JSX } from "../../../../utils";
import { classNames } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const memberGetterSetter = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <ul
            class={classNames(
                {
                    "tsd-signatures": true,
                },
                context.getReflectionClasses(props),
            )}
        >
            {!!props.getSignature && (
                <>
                    <li class="tsd-signature" id={props.getSignature.anchor}>
                        <span class="tsd-signature-keyword">get</span> {props.name}
                        {context.memberSignatureTitle(props.getSignature, {
                            hideName: true,
                        })}
                    </li>
                    <li class="tsd-description">{context.memberSignatureBody(props.getSignature)}</li>
                </>
            )}
            {!!props.setSignature && (
                <>
                    <li class="tsd-signature" id={props.setSignature.anchor}>
                        <span class="tsd-signature-keyword">set</span> {props.name}
                        {context.memberSignatureTitle(props.setSignature, {
                            hideName: true,
                        })}
                    </li>
                    <li class="tsd-description">{context.memberSignatureBody(props.setSignature)}</li>
                </>
            )}
        </ul>
    </>
);
