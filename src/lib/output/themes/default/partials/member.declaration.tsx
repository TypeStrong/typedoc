import type { DeclarationReflection, ReflectionType } from "../../../../models";
import { JSX, Raw } from "../../../../utils";
import { getKindClass, hasTypeParameters, renderTypeParametersSignature, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

function renderingTypeDeclarationIsUseful(declaration: DeclarationReflection): boolean {
    if (declaration.hasComment()) return true;
    if (declaration.children?.some(renderingTypeDeclarationIsUseful)) return true;
    if (declaration.type?.type === "reflection" && renderingTypeDeclarationIsUseful(declaration.type.declaration)) {
        return true;
    }

    return declaration.getAllSignatures().some((sig) => {
        return sig.hasComment() || sig.parameters?.some((p) => p.hasComment());
    });
}

export function memberDeclaration(context: DefaultThemeRenderContext, props: DeclarationReflection) {
    function renderTypeDeclaration(type: ReflectionType) {
        if (renderingTypeDeclarationIsUseful(type.declaration)) {
            return (
                <div class="tsd-type-declaration">
                    <h4>{context.i18n.theme_type_declaration()}</h4>
                    {context.parameter(type.declaration)}
                </div>
            );
        }
    }

    const visitor = { reflection: renderTypeDeclaration };

    /** Fix for #2717. If type is the same as value the type is omited */
    function shouldRenderType() {
        if (props.type && props.type.type === "literal") {
            const typeObject = props.type.toObject();
            const value = typeObject.value;
            if (!value) {
                // should be unreachable
                return true;
            }
            if (typeof value === "object") {
                return true;
            }
            const reflectionTypeString: string = value.toString();
            let defaultValue = props.defaultValue!;
            if (defaultValue) {
                // If the default value is string and it's wrapped in ' in the code, the value is wrapped in " and vice-versa
                if (
                    (defaultValue[0] === '"' && defaultValue[defaultValue.length - 1] === '"') ||
                    (defaultValue[0] === "'" && defaultValue[defaultValue.length - 1] === "'")
                ) {
                    defaultValue = defaultValue.slice(1, -1);
                }
            }

            if (reflectionTypeString === defaultValue.toString()) {
                return false;
            }
            return true;
        }
        return true;
    }

    return (
        <>
            <div class="tsd-signature">
                <span class={getKindClass(props)}>{wbr(props.name)}</span>
                {renderTypeParametersSignature(context, props.typeParameters)}
                {shouldRenderType() && (
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

            {props.type?.visit<JSX.Children>({
                reflection: renderTypeDeclaration,
                array: (arr) => arr.elementType.visit(visitor),
                intersection: (int) => int.types.map((t) => t.visit(visitor)),
                union: (union) => {
                    if (union.elementSummaries) {
                        const result: JSX.Children = [];
                        for (let i = 0; i < union.types.length; ++i) {
                            result.push(
                                <li>
                                    {context.type(union.types[i])}
                                    <Raw html={context.markdown(union.elementSummaries[i])} />
                                    {union.types[i].visit(visitor)}
                                </li>,
                            );
                        }
                        return <ul>{result}</ul>;
                    }
                    return union.types.map((t) => t.visit(visitor));
                },
                reference: (ref) => ref.typeArguments?.map((t) => t.visit(visitor)),
                tuple: (ref) => ref.elements.map((t) => t.visit(visitor)),
            })}

            {context.commentTags(props)}

            {context.memberSources(props)}
        </>
    );
}
