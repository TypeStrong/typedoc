import { wbr, join } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationReflection, ReflectionType } from "../../../../models";
export const memberDeclaration =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <div class="tsd-signature tsd-kind-icon">
                    {wbr(props.name)}
                    {!!props.typeParameters && (
                        <>
                            {"<"}
                            {join(", ", props.typeParameters, (item) => item.name)}
                            {">"}
                        </>
                    )}
                    {props.type && (
                        <>
                            <span class="tsd-signature-symbol">{!!props.flags.isOptional && "?"}:</span>{" "}
                            {partials.type(props.type)}
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

                {partials.memberSources(props)}

                {partials.comment(props)}

                {!!props.typeParameters && (
                    <>
                        <h4 class="tsd-type-parameters-title">Type parameters</h4>
                        {partials.typeParameters(props)}
                    </>
                )}
                {props.type instanceof ReflectionType && (
                    <div class="tsd-type-declaration">
                        <h4>Type declaration</h4>
                        {partials.parameter(props.type.declaration)}
                    </div>
                )}
            </>
        );
