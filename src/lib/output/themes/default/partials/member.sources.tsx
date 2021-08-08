import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationReflection, SignatureReflection } from "../../../../models";

export const memberSources = (
    context: DefaultThemeRenderContext,
    props: SignatureReflection | DeclarationReflection
) => (
    <>
        <aside class="tsd-sources">
            {!!props.implementationOf && (
                <p>
                    {"Implementation of "}
                    {context.typeAndParent(props.implementationOf)}
                </p>
            )}
            {!!props.inheritedFrom && (
                <p>
                    {"Inherited from "}
                    {context.typeAndParent(props.inheritedFrom)}
                </p>
            )}
            {!!props.overwrites && (
                <p>
                    {"Overrides "}
                    {context.typeAndParent(props.overwrites)}
                </p>
            )}
            {!!props.sources && (
                <ul>
                    {props.sources.map((item) =>
                        item.url ? (
                            <li>
                                Defined in
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
            )}
        </aside>
    </>
);
