import type { DeclarationReflection } from "../../../../models/index.js";
import { JSX } from "#utils";
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
                <li>
                    <div class="tsd-signature" id={context.getAnchor(props.getSignature)}>
                        {context.memberSignatureTitle(props.getSignature)}
                    </div>
                    <div class="tsd-description">{context.memberSignatureBody(props.getSignature)}</div>
                </li>
            )}
            {!!props.setSignature && (
                <li>
                    <div class="tsd-signature" id={context.getAnchor(props.setSignature)}>
                        {context.memberSignatureTitle(props.setSignature)}
                    </div>
                    <div class="tsd-description">{context.memberSignatureBody(props.setSignature)}</div>
                </li>
            )}
        </ul>
    </>
);
