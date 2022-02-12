import { renderFlags, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import { DeclarationReflection, ReferenceReflection } from "../../../../models";
import { anchorIcon } from "./anchor-icon";

export const member = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <section class={"tsd-panel tsd-member " + props.cssClasses}>
        <a id={props.anchor} class="tsd-anchor"></a>
        {!!props.name && (
            <h3 class="tsd-anchor-link">
                {renderFlags(props.flags)}
                {wbr(props.name)}
                {anchorIcon(props.anchor)}
            </h3>
        )}
        {props.signatures
            ? context.memberSignatures(props)
            : props.hasGetterOrSetter()
            ? context.memberGetterSetter(props)
            : props instanceof ReferenceReflection
            ? context.memberReference(props)
            : context.memberDeclaration(props)}

        {props.groups?.map((item) => item.children.map((item) => !item.hasOwnDocument && context.member(item)))}
    </section>
);
