import { DeclarationReflection, ReflectionKind, ReflectionType } from "../../../../models";
import { JSX } from "../../../../utils";
import { hasTypeParameters, renderTypeParametersSignature, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const memberDeclaration = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <div class="tsd-signature">
            {wbr(props.name)}
            {renderTypeParametersSignature(props.typeParameters)}
            {props.type && (
                <>
                    <span class="tsd-signature-symbol">{!!props.flags.isOptional && "?"}:</span>{" "}
                    {context.type(props.type)}
                </>
            )}
            {!!props.defaultValue && props.kind !== ReflectionKind.EnumMember && (
                <>
                    <span class="tsd-signature-symbol">
                        {" = "}
                        {props.defaultValue}
                    </span>
                </>
            )}
        </div>

        {context.comment(props)}

        {hasTypeParameters(props) && (
            <>
                <h4 class="tsd-type-parameters-title">Type Parameters</h4>
                {context.typeParameters(props.typeParameters)}
            </>
        )}
        {props.type instanceof ReflectionType && (
            <div class="tsd-type-declaration">
                <h4>Type declaration</h4>
                {context.parameter(props.type.declaration)}
            </div>
        )}

        {context.memberSources(props)}
    </>
);
