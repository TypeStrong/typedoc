import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { i18n, JSX } from "#utils";
import type { DeclarationReflection, SignatureReflection, SourceReference } from "../../../../models/index.js";

function sourceLink(context: DefaultThemeRenderContext, item: SourceReference) {
    if (!item.url) {
        return (
            <li>
                {i18n.theme_defined_in()} {item.fileName}:{item.line}
            </li>
        );
    }

    if (context.options.getValue("sourceLinkExternal")) {
        return (
            <li>
                {i18n.theme_defined_in()}{" "}
                <a href={item.url} class="external" target="_blank">
                    {item.fileName}:{item.line}
                </a>
            </li>
        );
    }

    return (
        <li>
            {i18n.theme_defined_in()}{" "}
            <a href={item.url}>
                {item.fileName}:{item.line}
            </a>
        </li>
    );
}

export const memberSources = (
    context: DefaultThemeRenderContext,
    props: SignatureReflection | DeclarationReflection,
) => {
    const sources: JSX.Element[] = [];

    if (props.implementationOf) {
        sources.push(
            <p>
                {i18n.theme_implementation_of()} {context.typeAndParent(props.implementationOf)}
            </p>,
        );
    }
    if (props.inheritedFrom) {
        sources.push(
            <p>
                {i18n.theme_inherited_from()} {context.typeAndParent(props.inheritedFrom)}
            </p>,
        );
    }
    if (props.overwrites) {
        sources.push(
            <p>
                {i18n.theme_overrides()} {context.typeAndParent(props.overwrites)}
            </p>,
        );
    }
    if (props.sources?.length) {
        sources.push(<ul>{props.sources.map((item) => sourceLink(context, item))}</ul>);
    }

    if (sources.length === 0) {
        return <></>;
    }

    return <aside class="tsd-sources">{sources}</aside>;
};
