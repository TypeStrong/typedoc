import { renderFlags, wbr } from "../../lib";
import { DeclarationReflection, ReferenceReflection } from "../../../../models";
import { createElement } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../../default/DefaultThemeRenderContext";

export const member = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <section class={"tsd-panel tsd-member " + props.cssClasses}>
            <a name={props.anchor} class="tsd-anchor"></a>
            {!!props.name && (
                <h3>
                    {renderFlags(props.flags)}
                    {wbr(props.name)}
                </h3>
            )}
            {props.signatures
                ? context.memberSignatures(props)
                : props.hasGetterOrSetter()
                ? context.memberGetterSetter(props)
                : props instanceof ReferenceReflection
                ? context.memberReference(props)
                : context.memberDeclaration(props)}
        </section>

        {context.index(props)}
        {context.members(props)}
    </>
);
