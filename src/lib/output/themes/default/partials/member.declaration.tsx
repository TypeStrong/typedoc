import type { DeclarationReflection } from "../../../../models/index.js";
import { JSX } from "../../../../utils/index.js";
import { getKindClass, hasTypeParameters, renderTypeParametersSignature, wbr } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

void JSX; // TS is confused and thinks this is unused

export function memberDeclaration(context: DefaultThemeRenderContext, props: DeclarationReflection) {
    return (
        <>
            <div class="tsd-signature">
                <span class={getKindClass(props)}>{wbr(props.name)}</span>
                {renderTypeParametersSignature(context, props.typeParameters)}
                {props.type && (
                    <>
                        <span class="tsd-signature-symbol">{!!props.flags.isOptional && "?"}:</span>{" "}
                        {context.type(props.type)}
                    </>
                )}
                {!!props.defaultValue && (
                    <>
                        <span class="tsd-signature-symbol">
                            {" = "}
                            {props.defaultValue}
                        </span>
                    </>
                )}
            </div>

            {context.commentSummary(props)}

            {hasTypeParameters(props) && context.typeParameters(props.typeParameters)}

            {props.type && context.typeDeclaration(props.type)}

            {context.commentTags(props)}

            {context.memberSources(props)}
        </>
    );
}
