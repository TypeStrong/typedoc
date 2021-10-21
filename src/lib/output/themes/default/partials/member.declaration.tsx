import { DeclarationReflection, ReflectionType } from "../../../../models";
import { JSX } from "../../../../utils";
import { renderTypeParametersSignature, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const memberDeclaration = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <div class="tsd-signature tsd-kind-icon">
            {wbr(props.name)}
            {renderTypeParametersSignature(props.typeParameters)}
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

        {context.memberSources(props)}

        {context.comment(props)}

        {!!props.typeParameters && (
            <>
                <h4 class="tsd-type-parameters-title">Type parameters</h4>
                {context.typeParameters(props.typeParameters)}
            </>
        )}
        {props.type instanceof ReflectionType && (
            <div class="tsd-type-declaration">
                <h4>Type declaration</h4>
                {context.parameter(props.type.declaration)}
            </div>
        )}
    </>
);
