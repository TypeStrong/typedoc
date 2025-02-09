import type { DeclarationReflection } from "../../../../models/index.js";
import { JSX } from "../../../../utils/index.js";
import { classNames } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

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
                <li class={context.getReflectionClasses(props.getSignature)}>
                    <div class="tsd-signature" id={props.getSignature.anchor}>
                        {context.memberSignatureTitle(props.getSignature)}
                    </div>
                    <div class="tsd-description">{context.memberSignatureBody(props.getSignature)}</div>
                </li>
            )}
            {!!props.setSignature && (
                <li class={context.getReflectionClasses(props.setSignature)}>
                    <div class="tsd-signature" id={props.setSignature.anchor}>
                        {context.memberSignatureTitle(props.setSignature)}
                    </div>
                    <div class="tsd-description">{context.memberSignatureBody(props.setSignature)}</div>
                </li>
            )}
        </ul>
    </>
);
