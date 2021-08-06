import { renderFlags, wbr } from "../../lib";
import { DeclarationReflection, ReferenceReflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";
import { createElement } from "../../../../utils";

export const member =
    ({ partials }: MinimalThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <section class={"tsd-panel tsd-member " + props.cssClasses}>
                    <a name={props.anchor} class="tsd-anchor"></a>
                    {!!props.name && (
                        <h3>
                            {renderFlags(props.flags)}
                            {wbr(props.name)}
                        </h3>
                    )}
                    {props.signatures ? (
                        <> {partials.memberSignatures(props)}</>
                    ) : props.hasGetterOrSetter() ? (
                        <>{partials.memberGetterSetter(props)}</>
                    ) : props instanceof ReferenceReflection ? (
                        <>{partials.memberReference(props)}</>
                    ) : (
                        <> {partials.memberDeclaration(props)}</>
                    )}
                </section>

                {partials.index(props)}
                {partials.members(props)}
            </>
        );
