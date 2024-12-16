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
                <>
                    <li class="tsd-signature" id={context.getAnchor(props.getSignature)}>
                        {context.memberSignatureTitle(props.getSignature)}
                    </li>
                    <li class="tsd-description">{context.memberSignatureBody(props.getSignature)}</li>
                </>
            )}
            {!!props.setSignature && (
                <>
                    <li class="tsd-signature" id={context.getAnchor(props.setSignature)}>
                        {context.memberSignatureTitle(props.setSignature)}
                    </li>
                    <li class="tsd-description">{context.memberSignatureBody(props.setSignature)}</li>
                </>
            )}
        </ul>
    </>
);
