import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { ArrayType, ReferenceType, SignatureReflection, type Type } from "#models";
import { JSX } from "#utils";

export const typeAndParent = (context: DefaultThemeRenderContext, props: Type): JSX.Element => {
    if (props instanceof ArrayType) {
        return (
            <>
                {context.typeAndParent(props.elementType)}
                []
            </>
        );
    }

    if (props instanceof ReferenceType) {
        if (props.reflection) {
            const refl = props.reflection instanceof SignatureReflection ? props.reflection.parent : props.reflection;
            const parent = refl.parent!;

            return (
                <>
                    {<a href={context.urlTo(parent)}>{parent.name}</a>}.{<a href={context.urlTo(refl)}>{refl.name}</a>}
                </>
            );
        } else if (props.externalUrl) {
            if (props.externalUrl === "#") {
                return <>{props.toString()}</>;
            } else {
                return <a href={props.externalUrl} class="external" target="_blank">{props.name}</a>;
            }
        }
    }

    return <>{props.toString()}</>;
};
