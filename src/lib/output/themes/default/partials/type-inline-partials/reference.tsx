import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { ReferenceType } from "../../../../../models";

export const reference =
    ({ relativeURL, partials }: DefaultThemeRenderContext) =>
    (props: ReferenceType) => {
        const reflection = props.reflection;
        return (
            <>
                {reflection ? (
                    <a
                        href={relativeURL(reflection.url) || ""}
                        class="tsd-signature-type"
                        data-tsd-kind={reflection.kindString}
                    >
                        {reflection.name}
                    </a>
                ) : (
                    <span class="tsd-signature-type">{props.name}</span>
                )}
                {props.typeArguments && props.typeArguments.length > 0 && (
                    <>
                        <span class="tsd-signature-symbol">{"<"}</span>
                        {props.typeArguments.map((item, i) => (
                            <>
                                {i > 0 && <span class="tsd-signature-symbol">, </span>}
                                {partials.type(item)}
                            </>
                        ))}
                        <span class="tsd-signature-symbol">{">"}</span>
                    </>
                )}
            </>
        );
    };
