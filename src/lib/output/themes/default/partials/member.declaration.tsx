import { DeclarationReflection, ReflectionType } from "../../../../models";
import { JSX } from "../../../../utils";
import { getKindClass, hasTypeParameters, renderTypeParametersSignature, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const memberDeclaration = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
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

        {props.type instanceof ReflectionType && (
            <div class="tsd-type-declaration">
                <h4>Type declaration</h4>
                {context.parameter(props.type.declaration)}
            </div>
        )}

        {context.commentTags(props)}

        {context.memberSources(props)}
    </>
);
