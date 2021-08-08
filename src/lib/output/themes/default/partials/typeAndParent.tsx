import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { ArrayType, ReferenceType, SignatureReflection, Type } from "../../../../models";
import { JSX, createElement } from "../../../../utils";

export const typeAndParent = ({ relativeURL, partials }: DefaultThemeRenderContext, props: Type): JSX.Element => {
    if (!props) return <>{"        void\n"}</>;

    if (props instanceof ArrayType) {
        return (
            <>
                {partials.typeAndParent(props.elementType)}
                []
            </>
        );
    }

    if (props instanceof ReferenceType && props.reflection) {
        if (props.reflection instanceof SignatureReflection) {
            return (
                <>
                    {props.reflection.parent?.parent?.url ? (
                        <a href={relativeURL(props.reflection.parent.parent.url)}>
                            {props.reflection.parent.parent.name}
                        </a>
                    ) : (
                        <> {props.reflection.parent?.parent?.name}</>
                    )}
                    .
                    {props.reflection.parent?.url ? (
                        <a href={relativeURL(props.reflection.parent.url)}>{props.reflection.parent.name}</a>
                    ) : (
                        <> {props.reflection.parent?.name}</>
                    )}
                </>
            );
        } else {
            return (
                <>
                    {props.reflection.parent?.url ? (
                        <a href={relativeURL(props.reflection.parent.url)}>{props.reflection.parent.name}</a>
                    ) : (
                        <> {props.reflection.parent?.name}</>
                    )}
                    .
                    {props.reflection.url ? (
                        <a href={relativeURL(props.reflection.url)}>{props.reflection.name}</a>
                    ) : (
                        <> {props.reflection.name}</>
                    )}
                </>
            );
        }
    }

    return <> {props.toString()}</>;
};
