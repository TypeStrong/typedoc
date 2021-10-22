import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { DeclarationReflection, SignatureReflection } from "../../../../models";

export const memberSources = (
    context: DefaultThemeRenderContext,
    props: SignatureReflection | DeclarationReflection
) => {
    const sources: JSX.Element[] = [];

    if (props.implementationOf) {
        sources.push(
            <p>
                {"Implementation of "}
                {context.typeAndParent(props.implementationOf)}
            </p>
        );
    }
    if (props.inheritedFrom) {
        sources.push(
            <p>
                {"Inherited from "}
                {context.typeAndParent(props.inheritedFrom)}
            </p>
        );
    }
    if (props.overwrites) {
        sources.push(
            <p>
                {"Overrides "}
                {context.typeAndParent(props.overwrites)}
            </p>
        );
    }
    if (props.sources) {
        sources.push(
            <ul>
                {props.sources.map((item) =>
                    item.url ? (
                        <li>
                            {"Defined in "}
                            <a href={item.url}>
                                {item.fileName}:{item.line}
                            </a>
                        </li>
                    ) : (
                        <li>
                            Defined in {item.fileName}:{item.line}
                        </li>
                    )
                )}
            </ul>
        );
    }

    if (sources.length === 0) {
        return <></>;
    }

    return <aside class="tsd-sources">{sources}</aside>;
};
