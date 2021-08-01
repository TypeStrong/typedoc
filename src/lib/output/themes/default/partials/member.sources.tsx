import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationReflection, SignatureReflection } from "../../../../models";
export const memberSources =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: SignatureReflection | DeclarationReflection) =>
        (
            <>
                <aside class="tsd-sources">
                    {" "}
                    {!!props.implementationOf && (
                        <p>
                            {"Implementation of "}
                            {partials.typeAndParent(props.implementationOf)}
                        </p>
                    )}
                    {!!props.inheritedFrom && (
                        <p>
                            {"Inherited from "}
                            {partials.typeAndParent(props.inheritedFrom)}
                        </p>
                    )}
                    {!!props.overwrites && (
                        <p>
                            {"Overrides "}
                            {partials.typeAndParent(props.overwrites)}
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
