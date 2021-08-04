import { assertIsDeclarationReflection, wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationReflection, ReferenceReflection } from "../../../../models";

export const member =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <section class={"tsd-panel tsd-member " + props.cssClasses}>
                <a name={props.anchor} class="tsd-anchor"></a>
                {!!props.name && (
                    <h3>
                        {props.flags.flagNames.map((item) => (
                            <>
                                <span class={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                            </>
                        ))}
                        {wbr(props.name)}
                    </h3>
                )}
                {props.signatures ? (
                    <> {partials.memberSignatures(props)}</>
                ) : props.hasGetterOrSetter() ? (
                    partials.memberGetterSetter(props)
                ) : props instanceof ReferenceReflection ? (
                    partials.memberReference(props)
                ) : (
                    <> {partials.memberDeclaration(props)}</>
                )}

                {props.groups?.map((item) =>
                    item.children.map(
                        (item) => !item.hasOwnDocument && partials.member(assertIsDeclarationReflection(item))
                    )
                )}
            </section>
        );
